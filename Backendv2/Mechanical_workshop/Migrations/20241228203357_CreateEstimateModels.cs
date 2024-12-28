using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mechanical_workshop.Migrations
{
    /// <inheritdoc />
    public partial class CreateEstimateModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Note",
                table: "Estimates",
                newName: "CustomerNote");

            migrationBuilder.AddColumn<string>(
                name: "ExtendedDiagnostic",
                table: "Estimates",
                type: "varchar(2000)",
                maxLength: 2000,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "EstimateFlatFees",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Type = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FlatFeePrice = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    ExtendedPrice = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    Taxable = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    EstimateID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstimateFlatFees", x => x.ID);
                    table.ForeignKey(
                        name: "FK_EstimateFlatFees_Estimates_EstimateID",
                        column: x => x.EstimateID,
                        principalTable: "Estimates",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "EstimateLabors",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Type = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Duration = table.Column<int>(type: "int", nullable: false),
                    LaborRate = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    ExtendedPrice = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    Taxable = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    EstimateID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstimateLabors", x => x.ID);
                    table.ForeignKey(
                        name: "FK_EstimateLabors_Estimates_EstimateID",
                        column: x => x.EstimateID,
                        principalTable: "Estimates",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "EstimateParts",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Type = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PartNumber = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    NetPrice = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    ListPrice = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    ExtendedPrice = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    Taxable = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    EstimateID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstimateParts", x => x.ID);
                    table.ForeignKey(
                        name: "FK_EstimateParts_Estimates_EstimateID",
                        column: x => x.EstimateID,
                        principalTable: "Estimates",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Estimates_UserWorkshopID",
                table: "Estimates",
                column: "UserWorkshopID");

            migrationBuilder.CreateIndex(
                name: "IX_Estimates_VehicleID",
                table: "Estimates",
                column: "VehicleID");

            migrationBuilder.CreateIndex(
                name: "IX_EstimateFlatFees_EstimateID",
                table: "EstimateFlatFees",
                column: "EstimateID");

            migrationBuilder.CreateIndex(
                name: "IX_EstimateLabors_EstimateID",
                table: "EstimateLabors",
                column: "EstimateID");

            migrationBuilder.CreateIndex(
                name: "IX_EstimateParts_EstimateID",
                table: "EstimateParts",
                column: "EstimateID");

            migrationBuilder.AddForeignKey(
                name: "FK_Estimates_UserWorkshops_UserWorkshopID",
                table: "Estimates",
                column: "UserWorkshopID",
                principalTable: "UserWorkshops",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Estimates_Vehicles_VehicleID",
                table: "Estimates",
                column: "VehicleID",
                principalTable: "Vehicles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Estimates_UserWorkshops_UserWorkshopID",
                table: "Estimates");

            migrationBuilder.DropForeignKey(
                name: "FK_Estimates_Vehicles_VehicleID",
                table: "Estimates");

            migrationBuilder.DropTable(
                name: "EstimateFlatFees");

            migrationBuilder.DropTable(
                name: "EstimateLabors");

            migrationBuilder.DropTable(
                name: "EstimateParts");

            migrationBuilder.DropIndex(
                name: "IX_Estimates_UserWorkshopID",
                table: "Estimates");

            migrationBuilder.DropIndex(
                name: "IX_Estimates_VehicleID",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "ExtendedDiagnostic",
                table: "Estimates");

            migrationBuilder.RenameColumn(
                name: "CustomerNote",
                table: "Estimates",
                newName: "Note");
        }
    }
}
