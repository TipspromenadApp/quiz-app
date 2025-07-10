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
      try
      {
        if (loginUser == null || string.IsNullOrEmpty(loginUser.Email) || string.IsNullOrEmpty(loginUser.PasswordHash))
        {
          return BadRequest(new { message = "Invalid login data: Email and Password are required." });
        }

        var user = _context.Users.FirstOrDefault(u => u.Email.ToLower() == loginUser.Email.ToLower());

        if (user == null)
        {
          return Unauthorized(new { message = "Wrong email or password." });
        }

        if (!PasswordHelper.VerifyPassword(loginUser.PasswordHash, user.PasswordHash))
        {
          return Unauthorized(new { message = "Wrong email or password." });
        }

        return Ok(new { message = "Login successful" });
      }
      catch (Exception ex)
      {
        return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
      }
    }
  }
}


