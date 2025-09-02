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
            // Relations
            modelBuilder.Entity<QuizAnswer>()
                .HasOne(a => a.QuizResult)
                .WithMany(r => r.Answers)
                .HasForeignKey(a => a.QuizResultId)
                .OnDelete(DeleteBehavior.Cascade);

            // IMPORTANT: Your current DB/migration shows Question has: Id, Text, Type, Options (CSV), CorrectAnswer
            // So we seed using that exact shape (Options = "A,B,C,D")
            modelBuilder.Entity<Question>().HasData(
                new
                {
                    Id = 1,
                    Text = "Vilken av dessa drycker innehåller vanligtvis koffein?",
                    Type = "multiple",
                    Options = "Apelsinjuice,Vatten,Te,Mjölk",
                    CorrectAnswer = "Te"
                },
                new
                {
                    Id = 2,
                    Text = "Vad är sushi traditionellt inlindad i?",
                    Type = "multiple",
                    Options = "Sjögräs,Sallad,Rispapper,Plast",
                    CorrectAnswer = "Sjögräs"
                },
                new
                {
                    Id = 3,
                    Text = "Vilket av följande är ett vanligt sätt att minska stress?",
                    Type = "multiple",
                    Options = "Lyssna på lugn musik,Äta mer socker,Hoppa över sömn,Bråka på nätet",
                    CorrectAnswer = "Lyssna på lugn musik"
                },
                new
                {
                    Id = 4,
                    Text = "Vad producerar bin?",
                    Type = "multiple",
                    Options = "Honung,Smör,Olja,Mjölk",
                    CorrectAnswer = "Honung"
                },
                new
                {
                    Id = 5,
                    Text = "Vilken av dessa räknas som en frukt?",
                    Type = "multiple",
                    Options = "Äpple,Sallad,Morot,Broccoli",
                    CorrectAnswer = "Äpple"
                },
                new
                {
                    Id = 6,
                    Text = "Vilket land är känt för Eiffeltornet?",
                    Type = "multiple",
                    Options = "Frankrike,Italien,Tyskland,Spanien",
                    CorrectAnswer = "Frankrike"
                },
                new
                {
                    Id = 7,
                    Text = "Vad använder du för att skicka e-post?",
                    Type = "multiple",
                    Options = "Dator,Mikrovågsugn,TV,Ugn",
                    CorrectAnswer = "Dator"
                },
                new
                {
                    Id = 8,
                    Text = "Vad hjälper växter att växa?",
                    Type = "multiple",
                    Options = "Solljus,Mörker,Plast,Rök",
                    CorrectAnswer = "Solljus"
                },
                new
                {
                    Id = 9,
                    Text = "Vilken av följande är ett musikinstrument?",
                    Type = "multiple",
                    Options = "Gitarr,Tallrik,Stol,Sked",
                    CorrectAnswer = "Gitarr"
                },
                new
                {
                    Id = 10,
                    Text = "Vad är en vanlig frukostmat?",
                    Type = "multiple",
                    Options = "Flingor,Pizza,Biff,Popcorn",
                    CorrectAnswer = "Flingor"
                }
            );
        }
    }
}
