using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class TranslateQuestionsToSwedish : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CorrectAnswer", "OptionA", "OptionB", "OptionC", "OptionD", "Text" },
                values: new object[] { "Te", "Apelsinjuice", "Vatten", "Te", "Mjölk", "Vilken av dessa drycker innehåller vanligtvis koffein?" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CorrectAnswer", "OptionA", "OptionB", "OptionC", "OptionD", "Text" },
                values: new object[] { "Sjögräs", "Sjögräs", "Sallad", "Rispapper", "Plast", "Vad är sushi traditionellt inlindad i?" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CorrectAnswer", "OptionA", "OptionB", "OptionC", "OptionD", "Text" },
                values: new object[] { "Lyssna på lugn musik", "Lyssna på lugn musik", "Äta mer socker", "Hoppa över sömn", "Bråka på nätet", "Vilket av följande är ett vanligt sätt att minska stress?" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CorrectAnswer", "OptionA", "OptionB", "OptionC", "OptionD", "Text" },
                values: new object[] { "Honung", "Honung", "Smör", "Olja", "Mjölk", "Vad producerar bin?" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "CorrectAnswer", "OptionA", "OptionB", "OptionC", "Text" },
                values: new object[] { "Äpple", "Äpple", "Sallad", "Morot", "Vilken av dessa räknas som en frukt?" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "CorrectAnswer", "OptionA", "OptionB", "OptionC", "OptionD", "Text" },
                values: new object[] { "Frankrike", "Frankrike", "Italien", "Tyskland", "Spanien", "Vilket land är känt för Eiffeltornet?" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "CorrectAnswer", "OptionA", "OptionB", "OptionC", "OptionD", "Text" },
                values: new object[] { "Dator", "Dator", "Mikrovågsugn", "TV", "Ugn", "Vad använder du för att skicka e-post?" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "CorrectAnswer", "OptionA", "OptionB", "OptionC", "OptionD", "Text" },
                values: new object[] { "Solljus", "Solljus", "Mörker", "Plast", "Rök", "Vad hjälper växter att växa?" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "CorrectAnswer", "OptionA", "OptionB", "OptionC", "OptionD", "Text" },
                values: new object[] { "Gitarr", "Gitarr", "Tallrik", "Stol", "Sked", "Vilken av följande är ett musikinstrument?" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "CorrectAnswer", "OptionA", "OptionC", "Text" },
                values: new object[] { "Flingor", "Flingor", "Biff", "Vad är en vanlig frukostmat?" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CorrectAnswer", "OptionA", "OptionB", "OptionC", "OptionD", "Text" },
                values: new object[] { "Tea", "Orange juice", "Water", "Tea", "Milk", "Which of these drinks usually contains caffeine?" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CorrectAnswer", "OptionA", "OptionB", "OptionC", "OptionD", "Text" },
                values: new object[] { "Seaweed", "Seaweed", "Lettuce", "Rice paper", "Plastic", "What is sushi traditionally wrapped in?" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CorrectAnswer", "OptionA", "OptionB", "OptionC", "OptionD", "Text" },
                values: new object[] { "Listening to calming music", "Listening to calming music", "Eating more sugar", "Skipping sleep", "Arguing online", "Which of these is a common way to reduce stress?" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CorrectAnswer", "OptionA", "OptionB", "OptionC", "OptionD", "Text" },
                values: new object[] { "Honey", "Honey", "Butter", "Oil", "Milk", "What do bees produce?" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "CorrectAnswer", "OptionA", "OptionB", "OptionC", "Text" },
                values: new object[] { "Apple", "Apple", "Lettuce", "Carrot", "Which of these is considered a fruit?" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "CorrectAnswer", "OptionA", "OptionB", "OptionC", "OptionD", "Text" },
                values: new object[] { "France", "France", "Italy", "Germany", "Spain", "Which country is famous for the Eiffel Tower?" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "CorrectAnswer", "OptionA", "OptionB", "OptionC", "OptionD", "Text" },
                values: new object[] { "Computer", "Computer", "Microwave", "Television", "Oven", "What do you use to send an email?" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "CorrectAnswer", "OptionA", "OptionB", "OptionC", "OptionD", "Text" },
                values: new object[] { "Sunlight", "Sunlight", "Darkness", "Plastic", "Smoke", "What helps plants grow?" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "CorrectAnswer", "OptionA", "OptionB", "OptionC", "OptionD", "Text" },
                values: new object[] { "Guitar", "Guitar", "Plate", "Chair", "Spoon", "Which one is a musical instrument?" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "CorrectAnswer", "OptionA", "OptionC", "Text" },
                values: new object[] { "Cereal", "Cereal", "Steak", "What is a common breakfast food?" });
        }
    }
}
