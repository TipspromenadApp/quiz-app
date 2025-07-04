using Microsoft.EntityFrameworkCore;
using quiz_app.Models;

namespace quiz_app
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Question> Questions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Question>().HasData(
                new Question { Id = 1, Text = "Which of these drinks usually contains caffeine?", Type = "multiple", Options = "Orange juice,Water,Tea,Milk", CorrectAnswer = "Tea" },
                new Question { Id = 2, Text = "What is sushi traditionally wrapped in?", Type = "multiple", Options = "Seaweed,Lettuce,Rice paper,Plastic", CorrectAnswer = "Seaweed" },
                new Question { Id = 3, Text = "Which of these is a common way to reduce stress?", Type = "multiple", Options = "Listening to calming music,Eating more sugar,Skipping sleep,Arguing online", CorrectAnswer = "Listening to calming music" },
                new Question { Id = 4, Text = "What do bees produce?", Type = "multiple", Options = "Honey,Butter,Oil,Milk", CorrectAnswer = "Honey" },
                new Question { Id = 5, Text = "Which of these is considered a fruit?", Type = "multiple", Options = "Apple,Lettuce,Carrot,Broccoli", CorrectAnswer = "Apple" },
                new Question { Id = 6, Text = "Which country is famous for the Eiffel Tower?", Type = "multiple", Options = "France,Italy,Germany,Spain", CorrectAnswer = "France" },
                new Question { Id = 7, Text = "What do you use to send an email?", Type = "multiple", Options = "Computer,Microwave,Television,Oven", CorrectAnswer = "Computer" },
                new Question { Id = 8, Text = "What helps plants grow?", Type = "multiple", Options = "Sunlight,Darkness,Plastic,Smoke", CorrectAnswer = "Sunlight" },
                new Question { Id = 9, Text = "Which one is a musical instrument?", Type = "multiple", Options = "Guitar,Plate,Chair,Spoon", CorrectAnswer = "Guitar" },
                new Question { Id = 10, Text = "What is a common breakfast food?", Type = "multiple", Options = "Cereal,Pizza,Steak,Popcorn", CorrectAnswer = "Cereal" }
                // You can add more here gradually, but keep the format the same
            );
        }
    }
}
