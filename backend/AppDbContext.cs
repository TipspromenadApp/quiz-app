using Microsoft.EntityFrameworkCore;
using quiz_app.Models;

namespace quiz_app
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }

        public DbSet<Question> Questions { get; set; }
    }
}

