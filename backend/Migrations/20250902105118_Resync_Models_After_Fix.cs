using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class Resync_Models_After_Fix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Questions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Text = table.Column<string>(type: "TEXT", nullable: false),
                    OptionA = table.Column<string>(type: "TEXT", nullable: false),
                    OptionB = table.Column<string>(type: "TEXT", nullable: false),
                    OptionC = table.Column<string>(type: "TEXT", nullable: false),
                    OptionD = table.Column<string>(type: "TEXT", nullable: true),
                    CorrectAnswer = table.Column<string>(type: "TEXT", nullable: false),
                    Type = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Questions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuizResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserName = table.Column<string>(type: "TEXT", nullable: false),
                    RoundNumber = table.Column<int>(type: "INTEGER", nullable: false),
                    Score = table.Column<int>(type: "INTEGER", nullable: false),
                    TotalQuestions = table.Column<int>(type: "INTEGER", nullable: false),
                    DateTaken = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizResults", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Username = table.Column<string>(type: "TEXT", nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuizAnswers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    QuizResultId = table.Column<int>(type: "INTEGER", nullable: false),
                    Round = table.Column<int>(type: "INTEGER", nullable: false),
                    QuestionId = table.Column<string>(type: "TEXT", nullable: true),
                    Question = table.Column<string>(type: "TEXT", nullable: false),
                    Type = table.Column<string>(type: "TEXT", nullable: true),
                    SelectedAnswer = table.Column<string>(type: "TEXT", nullable: true),
                    CorrectAnswer = table.Column<string>(type: "TEXT", nullable: true),
                    IsCorrect = table.Column<bool>(type: "INTEGER", nullable: true),
                    UserAnswer = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuizAnswers_QuizResults_QuizResultId",
                        column: x => x.QuizResultId,
                        principalTable: "QuizResults",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Questions",
                columns: new[] { "Id", "CorrectAnswer", "OptionA", "OptionB", "OptionC", "OptionD", "Text", "Type" },
                values: new object[,]
                {
                    { 1, "Te", "Apelsinjuice", "Vatten", "Te", "Mjölk", "Vilken av dessa drycker innehåller vanligtvis koffein?", "multiple" },
                    { 2, "Sjögräs", "Sjögräs", "Sallad", "Rispapper", "Plast", "Vad är sushi traditionellt inlindad i?", "multiple" },
                    { 3, "Lyssna på lugn musik", "Lyssna på lugn musik", "Äta mer socker", "Hoppa över sömn", "Bråka på nätet", "Vilket av följande är ett vanligt sätt att minska stress?", "multiple" },
                    { 4, "Honung", "Honung", "Smör", "Olja", "Mjölk", "Vad producerar bin?", "multiple" },
                    { 5, "Äpple", "Äpple", "Sallad", "Morot", "Broccoli", "Vilken av dessa räknas som en frukt?", "multiple" },
                    { 6, "Frankrike", "Frankrike", "Italien", "Tyskland", "Spanien", "Vilket land är känt för Eiffeltornet?", "multiple" },
                    { 7, "Dator", "Dator", "Mikrovågsugn", "TV", "Ugn", "Vad använder du för att skicka e-post?", "multiple" },
                    { 8, "Solljus", "Solljus", "Mörker", "Plast", "Rök", "Vad hjälper växter att växa?", "multiple" },
                    { 9, "Gitarr", "Gitarr", "Tallrik", "Stol", "Sked", "Vilken av följande är ett musikinstrument?", "multiple" },
                    { 10, "Flingor", "Flingor", "Pizza", "Biff", "Popcorn", "Vad är en vanlig frukostmat?", "multiple" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_QuizAnswers_QuizResultId",
                table: "QuizAnswers",
                column: "QuizResultId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Questions");

            migrationBuilder.DropTable(
                name: "QuizAnswers");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "QuizResults");
        }
    }
}
