using Microsoft.AspNetCore.Mvc;
using quiz_app.Models;
using quiz_app.Helpers;
using Microsoft.EntityFrameworkCore;

namespace quiz_app.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class LoginController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LoginController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public IActionResult Login([FromBody] User loginUser)
        {
            // Look for a user in the database with the same email
            var user = _context.Users.FirstOrDefault(u => u.Email == loginUser.Email);

            // If user is not found, return Unauthorized
            if (user == null)
            {
                return Unauthorized("Wrong email or password");
            }

            // If password hash doesn't match, return Unauthorized
            if (!PasswordHelper.VerifyPassword(loginUser.PasswordHash, user.PasswordHash))
    return Unauthorized("Wrong email or password");


            // If both match, login is successful
            return Ok("Login successful");
        }
    }
}


