using Microsoft.AspNetCore.Mvc;
using quiz_app.Models;
using quiz_app.Helpers;
using BCrypt.Net;

namespace quiz_app.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class RegisterController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RegisterController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public IActionResult Register(User user)
        {
            if (_context.Users.Any(u => u.Email == user.Email))
            {
                return BadRequest("User with this email already exists.");
            }
  
            var newUser = new User
            {
                Username = user.Username,
                Email = user.Email,
                PasswordHash = PasswordHelper.HashPassword(user.PasswordHash)

            };

            _context.Users.Add(newUser);
            _context.SaveChanges();

            return Ok("User registered successfully.");
        }
    }
}
