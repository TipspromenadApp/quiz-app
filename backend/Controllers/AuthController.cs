using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using quiz_app.Models;
using quiz_app.Helpers;

namespace quiz_app.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AuthController(AppDbContext context) => _context = context;

        // POST: /api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest("Email and password are required.");

            var email = dto.Email.Trim().ToLowerInvariant();

            if (await _context.Users.AnyAsync(u => u.Email == email))
                return BadRequest("User with this email already exists.");

            var newUser = new User
            {
                Username = (dto.Username ?? email).Trim(),
                Email = email,
                
                PasswordHash = PasswordHelper.HashPassword(dto.Password)
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { newUser.Id, newUser.Username, newUser.Email });
        }

      
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest("Email and password are required.");

            var email = dto.Email.Trim().ToLowerInvariant();
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == email);
            if (user == null)
                return Unauthorized("Invalid credentials.");

         
            var ok = PasswordHelper.VerifyPassword(dto.Password, user.PasswordHash);
            if (!ok)
                return Unauthorized("Invalid credentials.");

            return Ok(new { message = "Login successful", user = new { user.Id, user.Username, user.Email } });
        }
    }

    public record RegisterDto(string Email, string Password, string? Username);
    public record LoginDto(string Email, string Password);
}
