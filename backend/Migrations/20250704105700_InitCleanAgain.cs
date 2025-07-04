using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitCleanAgain : Migration
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
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    Options = table.Column<string>(type: "TEXT", nullable: false),
                    CorrectAnswer = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Questions", x => x.Id);
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

            migrationBuilder.InsertData(
                table: "Questions",
                columns: new[] { "Id", "CorrectAnswer", "Options", "Text", "Type" },
                values: new object[,]
                {
                    { 1, "Tea", "Orange juice,Water,Tea,Milk", "Which of these drinks usually contains caffeine?", "multiple" },
                    { 2, "Seaweed", "Seaweed,Lettuce,Rice paper,Plastic", "What is sushi traditionally wrapped in?", "multiple" },
                    { 3, "Listening to calming music", "Listening to calming music,Eating more sugar,Skipping sleep,Arguing online", "Which of these is a common way to reduce stress?", "multiple" },
                    { 4, "Honey", "Honey,Butter,Oil,Milk", "What do bees produce?", "multiple" },
                    { 5, "Apple", "Apple,Lettuce,Carrot,Broccoli", "Which of these is considered a fruit?", "multiple" },
                    { 6, "France", "France,Italy,Germany,Spain", "Which country is famous for the Eiffel Tower?", "multiple" },
                    { 7, "Computer", "Computer,Microwave,Television,Oven", "What do you use to send an email?", "multiple" },
                    { 8, "Sunlight", "Sunlight,Darkness,Plastic,Smoke", "What helps plants grow?", "multiple" },
                    { 9, "Guitar", "Guitar,Plate,Chair,Spoon", "Which one is a musical instrument?", "multiple" },
                    { 10, "Cereal", "Cereal,Pizza,Steak,Popcorn", "What is a common breakfast food?", "multiple" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Questions");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
