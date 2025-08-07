using Microsoft.EntityFrameworkCore;
using quiz_app.Models;

namespace quiz_app
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<QuizResult> QuizResults { get; set; }
        public DbSet<AnswerEntry> AnswerEntries { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<QuizResult>()
                .HasMany(q => q.Answers)
                .WithOne()
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Question>().HasData(
                new Question { Id = 1, Text = "Which of these drinks usually contains caffeine?", Type = "multiple", OptionA = "Orange juice", OptionB = "Water", OptionC = "Tea", OptionD = "Milk", CorrectAnswer = "Tea" },
                new Question { Id = 2, Text = "What is sushi traditionally wrapped in?", Type = "multiple", OptionA = "Seaweed", OptionB = "Lettuce", OptionC = "Rice paper", OptionD = "Plastic", CorrectAnswer = "Seaweed" },
                new Question { Id = 3, Text = "Which of these is a common way to reduce stress?", Type = "multiple", OptionA = "Listening to calming music", OptionB = "Eating more sugar", OptionC = "Skipping sleep", OptionD = "Arguing online", CorrectAnswer = "Listening to calming music" },
                new Question { Id = 4, Text = "What do bees produce?", Type = "multiple", OptionA = "Honey", OptionB = "Butter", OptionC = "Oil", OptionD = "Milk", CorrectAnswer = "Honey" },
                new Question { Id = 5, Text = "Which of these is considered a fruit?", Type = "multiple", OptionA = "Apple", OptionB = "Lettuce", OptionC = "Carrot", OptionD = "Broccoli", CorrectAnswer = "Apple" },
                new Question { Id = 6, Text = "Which country is famous for the Eiffel Tower?", Type = "multiple", OptionA = "France", OptionB = "Italy", OptionC = "Germany", OptionD = "Spain", CorrectAnswer = "France" },
                new Question { Id = 7, Text = "What do you use to send an email?", Type = "multiple", OptionA = "Computer", OptionB = "Microwave", OptionC = "Television", OptionD = "Oven", CorrectAnswer = "Computer" },
                new Question { Id = 8, Text = "What helps plants grow?", Type = "multiple", OptionA = "Sunlight", OptionB = "Darkness", OptionC = "Plastic", OptionD = "Smoke", CorrectAnswer = "Sunlight" },
                new Question { Id = 9, Text = "Which one is a musical instrument?", Type = "multiple", OptionA = "Guitar", OptionB = "Plate", OptionC = "Chair", OptionD = "Spoon", CorrectAnswer = "Guitar" },
                new Question { Id = 10, Text = "What is a common breakfast food?", Type = "multiple", OptionA = "Cereal", OptionB = "Pizza", OptionC = "Steak", OptionD = "Popcorn", CorrectAnswer = "Cereal" }
            );
        }
    }
}

