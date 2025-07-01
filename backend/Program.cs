using quiz_app;
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// SQLite connection
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=quiz.db"));

// Add CORS policy
builder.Services.AddCors(options =>
{
  options.AddPolicy("AllowLocalhost", builder =>
  {
    builder.WithOrigins("http://localhost:5178")
           .AllowAnyMethod()
           .AllowAnyHeader();
  });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("AllowLocalhost");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run("http://localhost:5249");
