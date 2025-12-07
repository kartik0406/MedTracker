using System.Security.Claims;
using MedTracker.API.Data;
using MedTracker.API.Dtos;
using MedTracker.API.Middleware;
using MedTracker.API.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ---------- Services ----------

// EF Core
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Authentication - Azure AD JWT Bearer
var azureAdSection = builder.Configuration.GetSection("AzureAd");
var instance = azureAdSection["Instance"];   // https://login.microsoftonline.com/
var tenantId = azureAdSection["TenantId"];   // common
var clientId = azureAdSection["ClientId"];   // backend client id
var frontendClientId = "56f8ef2d-d6e0-4880-9803-8859b2e736ae"; // frontend client id

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Authority for both personal and work Microsoft accounts
        options.Authority = "https://login.microsoftonline.com/common/v2.0";

        options.TokenValidationParameters = new TokenValidationParameters
        {
            // Accept tokens for both backend API (work accounts) and frontend app (personal accounts)
            ValidAudiences = new[] { 
                clientId,                           // Backend API client ID
                frontendClientId,                   // Frontend SPA client ID
                $"api://{clientId}",                // API URI format
                "00000003-0000-0000-c000-000000000000" // Microsoft Graph (for basic scopes)
            },
            ValidateAudience = false,  // Temporarily disable to debug

            // For personal accounts issuers differ (STS v2 tokens)
            ValidateIssuer = false, 
            
            // Signing keys from metadata are already validated
            ValidateIssuerSigningKey = true,

            // Validate token lifetime
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(2)
        };
        
        // Add event handlers for debugging
        options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var authHeader = context.Request.Headers["Authorization"].ToString();
                Console.WriteLine($"Authorization header received: '{authHeader}'");
                if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
                {
                    var token = authHeader.Substring(7);
                    Console.WriteLine($"Token length: {token.Length}, starts with: {(token.Length > 10 ? token.Substring(0, 10) : token)}...");
                    Console.WriteLine($"Token has dots: {token.Contains('.')}");
                }
                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"Auth failed: {context.Exception.Message}");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                var claims = context.Principal?.Claims.Select(c => $"{c.Type}: {c.Value}");
                Console.WriteLine($"Token validated. Claims: {string.Join(", ", claims ?? Array.Empty<string>())}");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// CORS for React app
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173", "http://localhost:3000") // adjust if needed
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ---------- Middleware pipeline ----------
app.UseMiddleware<ErrorHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();

// ---------- Helper: get current user from token ----------
async Task<AppUser> GetOrCreateCurrentUserAsync(HttpContext httpContext, AppDbContext db)
{
    var user = httpContext.User;
    if (!user.Identity?.IsAuthenticated ?? true)
        throw new UnauthorizedAccessException("User not authenticated");

    // For personal Microsoft accounts, use "sub"
    var subjectId = user.FindFirst("sub")?.Value
                    ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? throw new Exception("No subject ID claim found");

    var name = user.FindFirst("name")?.Value
               ?? user.FindFirst(ClaimTypes.GivenName)?.Value
               ?? "Unknown";

    var email = user.FindFirst("preferred_username")?.Value
                ?? user.FindFirst(ClaimTypes.Email)?.Value
                ?? "unknown@example.com";

    var appUser = await db.AppUsers.FirstOrDefaultAsync(u => u.SubjectId == subjectId);
    var now = DateTime.UtcNow;

    if (appUser == null)
    {
        appUser = new AppUser
        {
            SubjectId = subjectId,
            DisplayName = name,
            Email = email,
            Provider = "Microsoft Personal",
            CreatedOn = now,
            LastLoginOn = now
        };
        db.AppUsers.Add(appUser);
    }
    else
    {
        appUser.DisplayName = name;
        appUser.Email = email;
        appUser.LastLoginOn = now;
    }

    db.LoginHistories.Add(new LoginHistory
    {
        AppUser = appUser,
        LoggedInAt = now,
        IpAddress = httpContext.Connection.RemoteIpAddress?.ToString(),
        UserAgent = httpContext.Request.Headers.UserAgent.ToString()
    });

    await db.SaveChangesAsync();
    return appUser;
}


// ---------- Endpoints ----------

// Health
app.MapGet("/", () => Results.Ok("MedTracker API is running"));

// Auth: returns and persists current user info
app.MapGet("/api/auth/me", async (HttpContext httpContext, AppDbContext db) =>
{
    var appUser = await GetOrCreateCurrentUserAsync(httpContext, db);

    var dto = new CurrentUserDto(
        appUser.AppUserId,
        appUser.DisplayName,
        appUser.Email,
        appUser.Provider
    );

    return Results.Ok(dto);
})
.RequireAuthorization();

// Medicines - paginated list with optional search & sorting
app.MapGet("/api/medicines", async (
    AppDbContext db,
    int page = 1,
    int pageSize = 10,
    string? search = null,
    string? sortBy = "name",
    string? sortDirection = "asc") =>
{
    if (page <= 0) page = 1;
    if (pageSize <= 0 || pageSize > 100) pageSize = 10;

    var query = db.Medicines.AsQueryable();

    if (!string.IsNullOrWhiteSpace(search))
    {
        search = search.ToLower();
        query = query.Where(m =>
            m.Name.ToLower().Contains(search) ||
            m.Company.ToLower().Contains(search));
    }

    // Sorting
    var isAsc = string.Equals(sortDirection, "asc", StringComparison.OrdinalIgnoreCase);

    query = sortBy?.ToLower() switch
    {
        "company" => isAsc ? query.OrderBy(m => m.Company) : query.OrderByDescending(m => m.Company),
        "price" => isAsc ? query.OrderBy(m => m.Price) : query.OrderByDescending(m => m.Price),
        "expirydate" => isAsc ? query.OrderBy(m => m.ExpiryDate) : query.OrderByDescending(m => m.ExpiryDate),
        "stock" => isAsc ? query.OrderBy(m => m.Stock) : query.OrderByDescending(m => m.Stock),
        _ => isAsc ? query.OrderBy(m => m.Name) : query.OrderByDescending(m => m.Name)
    };

    var totalCount = await query.CountAsync();
    var items = await query
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(m => new MedicineListItemDto(
            m.MedicineId,
            m.Name,
            m.Company,
            m.Price,
            m.ExpiryDate,
            m.Stock))
        .ToListAsync();

    var result = new PagedResult<MedicineListItemDto>(items, totalCount, page, pageSize);
    return Results.Ok(result);
})
.RequireAuthorization();

// Get single medicine
app.MapGet("/api/medicines/{id:int}", async (int id, AppDbContext db) =>
{
    var medicine = await db.Medicines.FindAsync(id);
    return medicine is null
        ? Results.NotFound()
        : Results.Ok(medicine);
})
.RequireAuthorization();

// Create medicine
app.MapPost("/api/medicines", async (MedicineCreateUpdateDto dto, AppDbContext db) =>
{
    var medicine = new Medicine
    {
        Name = dto.Name,
        Company = dto.Company,
        Price = dto.Price,
        ExpiryDate = dto.ExpiryDate,
        Stock = dto.Stock,
        CreatedOn = DateTime.UtcNow
    };

    db.Medicines.Add(medicine);
    await db.SaveChangesAsync();

    return Results.Created($"/api/medicines/{medicine.MedicineId}", medicine);
})
.RequireAuthorization();

// Update medicine
app.MapPut("/api/medicines/{id:int}", async (int id, MedicineCreateUpdateDto dto, AppDbContext db) =>
{
    var medicine = await db.Medicines.FindAsync(id);
    if (medicine is null)
        return Results.NotFound();

    medicine.Name = dto.Name;
    medicine.Company = dto.Company;
    medicine.Price = dto.Price;
    medicine.ExpiryDate = dto.ExpiryDate;
    medicine.Stock = dto.Stock;

    await db.SaveChangesAsync();
    return Results.NoContent();
})
.RequireAuthorization();

// Delete medicine
app.MapDelete("/api/medicines/{id:int}", async (int id, AppDbContext db) =>
{
    var medicine = await db.Medicines.FindAsync(id);
    if (medicine is null)
        return Results.NotFound();

    db.Medicines.Remove(medicine);
    await db.SaveChangesAsync();
    return Results.NoContent();
})
.RequireAuthorization();

app.Run();
