using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddQuestionModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OptionA",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "OptionB",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "OptionC",
                table: "Questions");

            migrationBuilder.RenameColumn(
                name: "OptionD",
                table: "Questions",
                newName: "Options");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Questions",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                table: "Questions");

            migrationBuilder.RenameColumn(
                name: "Options",
                table: "Questions",
                newName: "OptionD");

            migrationBuilder.AddColumn<string>(
                name: "OptionA",
                table: "Questions",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OptionB",
                table: "Questions",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OptionC",
                table: "Questions",
                type: "TEXT",
                nullable: true);
        }
    }
}
