using System.Net;
using System.Text.Json;

namespace MedTracker.API.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        var correlationId = Guid.NewGuid().ToString("N");
        context.Response.Headers["X-Correlation-Id"] = correlationId;

        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception, CorrelationId: {CorrelationId}", correlationId);

            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";

            var payload = new
            {
                title = "An unexpected error occurred.",
                status = context.Response.StatusCode,
                correlationId
            };

            var json = JsonSerializer.Serialize(payload);
            await context.Response.WriteAsync(json);
        }
    }
}