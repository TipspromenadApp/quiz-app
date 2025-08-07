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
        public IActionResult Login([FromBody] LoginRequest loginUser)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == loginUser.Email);

            if (user == null)
            {
                return Unauthorized("Wrong email or password");
            }

            if (!PasswordHelper.VerifyPassword(loginUser.Password, user.PasswordHash))
            {
                return Unauthorized("Wrong email or password");
            }

           
            return Ok(new
            {
                Username = user.Username,
                Email = user.Email
            });
        }
    }
}



