using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mechanical_workshop.Migrations
{
    /// <inheritdoc />
    public partial class CreateEstimate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Estimates_Vehicles_VehicleID",
                table: "Estimates");

            migrationBuilder.DropIndex(
                name: "IX_Estimates_VehicleID",
                table: "Estimates");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "Estimates",
                newName: "Note");

            migrationBuilder.RenameColumn(
                name: "Amount",
                table: "Estimates",
                newName: "Total");

            migrationBuilder.AddColumn<decimal>(
                name: "Subtotal",
                table: "Estimates",
                type: "decimal(65,30)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Tax",
                table: "Estimates",
                type: "decimal(65,30)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "UserWorkshopID",
                table: "Estimates",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Subtotal",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "Tax",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "UserWorkshopID",
                table: "Estimates");

            migrationBuilder.RenameColumn(
                name: "Total",
                table: "Estimates",
                newName: "Amount");

            migrationBuilder.RenameColumn(
                name: "Note",
                table: "Estimates",
                newName: "Description");

            migrationBuilder.CreateIndex(
                name: "IX_Estimates_VehicleID",
                table: "Estimates",
                column: "VehicleID");

            migrationBuilder.AddForeignKey(
                name: "FK_Estimates_Vehicles_VehicleID",
                table: "Estimates",
                column: "VehicleID",
                principalTable: "Vehicles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
