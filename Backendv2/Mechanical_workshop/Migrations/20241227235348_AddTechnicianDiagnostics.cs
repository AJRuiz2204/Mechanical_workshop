using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mechanical_workshop.Migrations
{
    /// <inheritdoc />
    public partial class AddTechnicianDiagnostics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TechnicianDiagnostics_Vehicles_VehicleId",
                table: "TechnicianDiagnostics");

            migrationBuilder.RenameColumn(
                name: "VehicleId",
                table: "TechnicianDiagnostics",
                newName: "DiagnosticId");

            migrationBuilder.RenameIndex(
                name: "IX_TechnicianDiagnostics_VehicleId",
                table: "TechnicianDiagnostics",
                newName: "IX_TechnicianDiagnostics_DiagnosticId");

            migrationBuilder.AddForeignKey(
                name: "FK_TechnicianDiagnostics_Diagnostics_DiagnosticId",
                table: "TechnicianDiagnostics",
                column: "DiagnosticId",
                principalTable: "Diagnostics",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TechnicianDiagnostics_Diagnostics_DiagnosticId",
                table: "TechnicianDiagnostics");

            migrationBuilder.RenameColumn(
                name: "DiagnosticId",
                table: "TechnicianDiagnostics",
                newName: "VehicleId");

            migrationBuilder.RenameIndex(
                name: "IX_TechnicianDiagnostics_DiagnosticId",
                table: "TechnicianDiagnostics",
                newName: "IX_TechnicianDiagnostics_VehicleId");

            migrationBuilder.AddForeignKey(
                name: "FK_TechnicianDiagnostics_Vehicles_VehicleId",
                table: "TechnicianDiagnostics",
                column: "VehicleId",
                principalTable: "Vehicles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
