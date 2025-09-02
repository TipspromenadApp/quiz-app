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
        public DbSet<QuizAnswer> QuizAnswers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {            
            modelBuilder.Entity<QuizAnswer>()
                .HasOne(a => a.QuizResult)
                .WithMany(r => r.Answers)
                .HasForeignKey(a => a.QuizResultId)
                .OnDelete(DeleteBehavior.Cascade);
           
            modelBuilder.Entity<Question>().HasData(
                new Question {
                    Id = 1,
                    Text = "Vilken av dessa drycker innehåller vanligtvis koffein?",
                    Type = "multiple",
                    OptionA = "Apelsinjuice",
                    OptionB = "Vatten",
                    OptionC = "Te",
                    OptionD = "Mjölk",
                    CorrectAnswer = "Te"
                },
                new Question {
                    Id = 2,
                    Text = "Vad är sushi traditionellt inlindad i?",
                    Type = "multiple",
                    OptionA = "Sjögräs",
                    OptionB = "Sallad",
                    OptionC = "Rispapper",
                    OptionD = "Plast",
                    CorrectAnswer = "Sjögräs"
                },
                new Question {
                    Id = 3,
                    Text = "Vilket av följande är ett vanligt sätt att minska stress?",
                    Type = "multiple",
                    OptionA = "Lyssna på lugn musik",
                    OptionB = "Äta mer socker",
                    OptionC = "Hoppa över sömn",
                    OptionD = "Bråka på nätet",
                    CorrectAnswer = "Lyssna på lugn musik"
                },
                new Question {
                    Id = 4,
                    Text = "Vad producerar bin?",
                    Type = "multiple",
                    OptionA = "Honung",
                    OptionB = "Smör",
                    OptionC = "Olja",
                    OptionD = "Mjölk",
                    CorrectAnswer = "Honung"
                },
                new Question {
                    Id = 5,
                    Text = "Vilken av dessa räknas som en frukt?",
                    Type = "multiple",
                    OptionA = "Äpple",
                    OptionB = "Sallad",
                    OptionC = "Morot",
                    OptionD = "Broccoli",
                    CorrectAnswer = "Äpple"
                },
                new Question {
                    Id = 6,
                    Text = "Vilket land är känt för Eiffeltornet?",
                    Type = "multiple",
                    OptionA = "Frankrike",
                    OptionB = "Italien",
                    OptionC = "Tyskland",
                    OptionD = "Spanien",
                    CorrectAnswer = "Frankrike"
                },
                new Question {
                    Id = 7,
                    Text = "Vad använder du för att skicka e-post?",
                    Type = "multiple",
                    OptionA = "Dator",
                    OptionB = "Mikrovågsugn",
                    OptionC = "TV",
                    OptionD = "Ugn",
                    CorrectAnswer = "Dator"
                },
                new Question {
                    Id = 8,
                    Text = "Vad hjälper växter att växa?",
                    Type = "multiple",
                    OptionA = "Solljus",
                    OptionB = "Mörker",
                    OptionC = "Plast",
                    OptionD = "Rök",
                    CorrectAnswer = "Solljus"
                },
                new Question {
                    Id = 9,
                    Text = "Vilken av följande är ett musikinstrument?",
                    Type = "multiple",
                    OptionA = "Gitarr",
                    OptionB = "Tallrik",
                    OptionC = "Stol",
                    OptionD = "Sked",
                    CorrectAnswer = "Gitarr"
                },
                new Question {
                    Id = 10,
                    Text = "Vad är en vanlig frukostmat?",
                    Type = "multiple",
                    OptionA = "Flingor",
                    OptionB = "Pizza",
                    OptionC = "Biff",
                    OptionD = "Popcorn",
                    CorrectAnswer = "Flingor"
                }
            );
        }
    }
}
