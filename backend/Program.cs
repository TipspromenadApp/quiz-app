using quiz_app;
using Microsoft.EntityFrameworkCore;
using quiz_app.Models;
using QuestPDF.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
QuestPDF.Settings.License = LicenseType.Community;

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<BotService>();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=quiz.db"));

// CORS: allow local dev + your current frontend tunnel
const string FrontDev = "FrontDev";
builder.Services.AddCors(options =>
{
  options.AddPolicy(FrontDev, policy =>
    policy.WithOrigins(
   "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.1.100:5173"
    )
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()
);

});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}




app.UseCors(FrontDev);
app.UseAuthorization();

app.MapControllers();


app.Run("http://0.0.0.0:5249");
