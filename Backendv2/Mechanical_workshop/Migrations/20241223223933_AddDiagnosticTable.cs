using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mechanical_workshop.Migrations
{
    /// <inheritdoc />
    public partial class AddDiagnosticTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Diagnostics_Users_AssignedTechnicianID",
                table: "Diagnostics");

            migrationBuilder.DropForeignKey(
                name: "FK_Diagnostics_Vehicles_VehicleID",
                table: "Diagnostics");

            migrationBuilder.DropIndex(
                name: "IX_Diagnostics_AssignedTechnicianID",
                table: "Diagnostics");

            migrationBuilder.DropColumn(
                name: "AssignedTechnicianID",
                table: "Diagnostics");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "Diagnostics");

            migrationBuilder.RenameColumn(
                name: "VehicleID",
                table: "Diagnostics",
                newName: "VehicleId");

            migrationBuilder.RenameColumn(
                name: "ID",
                table: "Diagnostics",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "Reason",
                table: "Diagnostics",
                newName: "ReasonForVisit");

            migrationBuilder.RenameIndex(
                name: "IX_Diagnostics_VehicleID",
                table: "Diagnostics",
                newName: "IX_Diagnostics_VehicleId");

            migrationBuilder.AddColumn<string>(
                name: "AssignedTechnician",
                table: "Diagnostics",
                type: "varchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Diagnostics",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddForeignKey(
                name: "FK_Diagnostics_Vehicles_VehicleId",
                table: "Diagnostics",
                column: "VehicleId",
                principalTable: "Vehicles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Diagnostics_Vehicles_VehicleId",
                table: "Diagnostics");

            migrationBuilder.DropColumn(
                name: "AssignedTechnician",
                table: "Diagnostics");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Diagnostics");

            migrationBuilder.RenameColumn(
                name: "VehicleId",
                table: "Diagnostics",
                newName: "VehicleID");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Diagnostics",
                newName: "ID");

            migrationBuilder.RenameColumn(
                name: "ReasonForVisit",
                table: "Diagnostics",
                newName: "Reason");

            migrationBuilder.RenameIndex(
                name: "IX_Diagnostics_VehicleId",
                table: "Diagnostics",
                newName: "IX_Diagnostics_VehicleID");

            migrationBuilder.AddColumn<int>(
                name: "AssignedTechnicianID",
                table: "Diagnostics",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "Diagnostics",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Diagnostics_AssignedTechnicianID",
                table: "Diagnostics",
                column: "AssignedTechnicianID");

            migrationBuilder.AddForeignKey(
                name: "FK_Diagnostics_Users_AssignedTechnicianID",
                table: "Diagnostics",
                column: "AssignedTechnicianID",
                principalTable: "Users",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Diagnostics_Vehicles_VehicleID",
                table: "Diagnostics",
                column: "VehicleID",
                principalTable: "Vehicles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
