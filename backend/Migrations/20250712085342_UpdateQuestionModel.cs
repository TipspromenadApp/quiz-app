using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateQuestionModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Options",
                table: "Questions",
                newName: "OptionC");

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "Questions",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AddColumn<string>(
                name: "OptionA",
                table: "Questions",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OptionB",
                table: "Questions",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OptionD",
                table: "Questions",
                type: "TEXT",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "OptionA", "OptionB", "OptionC", "OptionD" },
                values: new object[] { "Orange juice", "Water", "Tea", "Milk" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "OptionA", "OptionB", "OptionC", "OptionD" },
                values: new object[] { "Seaweed", "Lettuce", "Rice paper", "Plastic" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "OptionA", "OptionB", "OptionC", "OptionD" },
                values: new object[] { "Listening to calming music", "Eating more sugar", "Skipping sleep", "Arguing online" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "OptionA", "OptionB", "OptionC", "OptionD" },
                values: new object[] { "Honey", "Butter", "Oil", "Milk" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "OptionA", "OptionB", "OptionC", "OptionD" },
                values: new object[] { "Apple", "Lettuce", "Carrot", "Broccoli" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "OptionA", "OptionB", "OptionC", "OptionD" },
                values: new object[] { "France", "Italy", "Germany", "Spain" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "OptionA", "OptionB", "OptionC", "OptionD" },
                values: new object[] { "Computer", "Microwave", "Television", "Oven" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "OptionA", "OptionB", "OptionC", "OptionD" },
                values: new object[] { "Sunlight", "Darkness", "Plastic", "Smoke" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "OptionA", "OptionB", "OptionC", "OptionD" },
                values: new object[] { "Guitar", "Plate", "Chair", "Spoon" });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "OptionA", "OptionB", "OptionC", "OptionD" },
                values: new object[] { "Cereal", "Pizza", "Steak", "Popcorn" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OptionA",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "OptionB",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "OptionD",
                table: "Questions");

            migrationBuilder.RenameColumn(
                name: "OptionC",
                table: "Questions",
                newName: "Options");

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "Questions",
                type: "TEXT",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 1,
                column: "Options",
                value: "Orange juice,Water,Tea,Milk");

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 2,
                column: "Options",
                value: "Seaweed,Lettuce,Rice paper,Plastic");

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 3,
                column: "Options",
                value: "Listening to calming music,Eating more sugar,Skipping sleep,Arguing online");

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 4,
                column: "Options",
                value: "Honey,Butter,Oil,Milk");

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 5,
                column: "Options",
                value: "Apple,Lettuce,Carrot,Broccoli");

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 6,
                column: "Options",
                value: "France,Italy,Germany,Spain");

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 7,
                column: "Options",
                value: "Computer,Microwave,Television,Oven");

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 8,
                column: "Options",
                value: "Sunlight,Darkness,Plastic,Smoke");

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 9,
                column: "Options",
                value: "Guitar,Plate,Chair,Spoon");

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 10,
                column: "Options",
                value: "Cereal,Pizza,Steak,Popcorn");
        }
    }
}
