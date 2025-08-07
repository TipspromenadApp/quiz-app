using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAnswerEntriesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AnswerEntry_QuizResults_QuizResultId",
                table: "AnswerEntry");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AnswerEntry",
                table: "AnswerEntry");

            migrationBuilder.RenameTable(
                name: "AnswerEntry",
                newName: "AnswerEntries");

            migrationBuilder.RenameIndex(
                name: "IX_AnswerEntry_QuizResultId",
                table: "AnswerEntries",
                newName: "IX_AnswerEntries_QuizResultId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AnswerEntries",
                table: "AnswerEntries",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AnswerEntries_QuizResults_QuizResultId",
                table: "AnswerEntries",
                column: "QuizResultId",
                principalTable: "QuizResults",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AnswerEntries_QuizResults_QuizResultId",
                table: "AnswerEntries");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AnswerEntries",
                table: "AnswerEntries");

            migrationBuilder.RenameTable(
                name: "AnswerEntries",
                newName: "AnswerEntry");

            migrationBuilder.RenameIndex(
                name: "IX_AnswerEntries_QuizResultId",
                table: "AnswerEntry",
                newName: "IX_AnswerEntry_QuizResultId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AnswerEntry",
                table: "AnswerEntry",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AnswerEntry_QuizResults_QuizResultId",
                table: "AnswerEntry",
                column: "QuizResultId",
                principalTable: "QuizResults",
                principalColumn: "Id");
        }
    }
}
