using System.Security.Cryptography;
using System.Text;
using BCrypt.Net;

namespace quiz_app.Helpers
{
  public static class PasswordHelper
  {
    public static string HashPassword(string password)
    {
      return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public static bool VerifyPassword(string enteredPassword, string storedHash)
    {
      return BCrypt.Net.BCrypt.Verify(enteredPassword, storedHash);
    }
  }
}


