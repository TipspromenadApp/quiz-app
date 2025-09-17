using Microsoft.EntityFrameworkCore;
using QuestPDF.Infrastructure;
using quiz_app;
using quiz_app.Services;

var builder = WebApplication.CreateBuilder(args);

QuestPDF.Settings.License = LicenseType.Community;


builder.Services.AddSingleton<IFakeQuestionGenerator, FakeQuestionGenerator>();
builder.Services.AddSingleton<BotService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=quiz.db"));

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
