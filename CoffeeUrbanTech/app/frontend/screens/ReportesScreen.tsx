import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import ReportSummary from "../components/ReportSummary";
import ProductSalesChart from "../components/ProductSalesChart";
import DataTable from "../components/DataTable";

import {
  collection,
  query,
  onSnapshot,
  where,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "../../../firebaseConfigWeb";
import {
  Product,
  Purchase,
  Sale,
  SoldItem,
  PurchasedItem,
} from "../../firebaseData";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const getPeriodTimestamps = (
  period: string
): { startDate: Timestamp | null; endDate: Timestamp | null } => {
  const now = new Date();
  let startDate: Date | null = null;
  let endDate: Date | null = now;

  switch (period) {
    case "today":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "week":
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - now.getDay()
      );
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = null;
      endDate = null;
  }

  return {
    startDate: startDate ? Timestamp.fromDate(startDate) : null,
    endDate: endDate ? Timestamp.fromDate(endDate) : null,
  };
};

export default function ReportesScreen() {
  const [period, setPeriod] = useState("today");
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);

  const [reportStats, setReportStats] = useState({
    totalRevenue: 0,
    totalCosts: 0,
    totalTransactions: 0,
    avgTicket: 0,
    netProfit: 0,
    profitMargin: 0,
  });
  const [productSalesChartData, setProductSalesChartData] = useState<any[]>([]);
  type TableData = {
    title: string;
    headers: string[];
    rows: string[][];
  };

  const [categoryTableData, setCategoryTableData] = useState<TableData>({
    title: "🏷️ Ventas por Categoría",
    headers: ["Categoría", "Cantidad", "Ingresos", "%"],
    rows: [],
  });
  const [topProductsTableData, setTopProductsTableData] = useState<TableData>({
    title: "🏆 Productos Más Vendidos",
    headers: ["Producto", "Cantidad", "Ingresos", "Margen"],
    rows: [],
  });
  const [costAnalysisTableData, setCostAnalysisTableData] = useState<TableData>(
    {
      title: "💰 Análisis de Costos",
      headers: ["Concepto", "Monto", "% del Total"],
      rows: [],
    }
  );
  const [inventoryStatusTableData, setInventoryStatusTableData] =
    useState<TableData>({
      title: "📦 Estado del Inventario",
      headers: ["Producto", "Stock", "Estado", "Valor"],
      rows: [],
    });

  useEffect(() => {
    const q = query(collection(db, "products"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const productsData: Product[] = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Product)
        );
        setProducts(productsData);
      },
      (error) => {
        console.error("Error loading products:", error);
        Alert.alert(
          "Error",
          "No se pudieron cargar los productos para reportes."
        );
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setLoadingReports(true);
    const { startDate, endDate } = getPeriodTimestamps(period);

    let salesQuery: any = collection(db, "sales");
    if (startDate && endDate) {
      salesQuery = query(
        salesQuery,
        where("date", ">=", startDate),
        where("date", "<=", endDate),
        orderBy("date", "desc")
      );
    } else {
      salesQuery = query(salesQuery, orderBy("date", "desc"));
    }

    const unsubscribeSales = onSnapshot(
      salesQuery,
      (snapshot: { docs: any[] }) => {
        const salesData: Sale[] = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
              date: doc.data().date || Timestamp.now(),
            } as Sale)
        );
        setSales(salesData);
      },
      (error) => {
        console.error("Error loading sales:", error);
        Alert.alert("Error", "No se pudieron cargar las ventas para reportes.");
      }
    );

    // Fetch Purchases
    let purchasesQuery: any = collection(db, "purchases");
    if (startDate && endDate) {
      purchasesQuery = query(
        purchasesQuery,
        where("purchaseDate", ">=", startDate),
        where("purchaseDate", "<=", endDate),
        orderBy("purchaseDate", "desc")
      );
    } else {
      purchasesQuery = query(purchasesQuery, orderBy("purchaseDate", "desc"));
    }

    const unsubscribePurchases = onSnapshot(
      purchasesQuery,
      (snapshot: { docs: any[] }) => {
        const purchasesData: Purchase[] = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
              purchaseDate: doc.data().purchaseDate || Timestamp.now(),
            } as Purchase)
        );
        setPurchases(purchasesData);
      },
      (error) => {
        console.error("Error loading purchases:", error);
        Alert.alert(
          "Error",
          "No se pudieron cargar las compras para reportes."
        );
      }
    );

    return () => {
      unsubscribeSales();
      unsubscribePurchases();
    };
  }, [period]);

  useEffect(() => {
    if (
      sales.length === 0 &&
      purchases.length === 0 &&
      products.length === 0 &&
      !loadingReports
    ) {
      setReportStats({
        totalRevenue: 0,
        totalCosts: 0,
        totalTransactions: 0,
        avgTicket: 0,
        netProfit: 0,
        profitMargin: 0,
      });
      setProductSalesChartData([]);
      setCategoryTableData((prev) => ({ ...prev, rows: [] }));
      setTopProductsTableData((prev) => ({ ...prev, rows: [] }));
      setCostAnalysisTableData((prev) => ({ ...prev, rows: [] }));
      setInventoryStatusTableData((prev) => ({ ...prev, rows: [] }));
      setLoadingReports(false);
      return;
    }

    const totalRevenue = sales.reduce(
      (sum, sale) => sum + (sale.total || 0),
      0
    );
    const totalCosts = purchases.reduce(
      (sum, purchase) => sum + (purchase.total || 0),
      0
    );
    const totalTransactions = sales.length;
    const avgTicket =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const netProfit = totalRevenue - totalCosts;
    const profitMargin =
      totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    setReportStats({
      totalRevenue,
      totalCosts,
      totalTransactions,
      avgTicket,
      netProfit,
      profitMargin,
    });

    const productSalesMap = new Map<string, number>();
    sales.forEach((sale) => {
      (sale.items || []).forEach((item: any) => {
        productSalesMap.set(
          item.productName,
          (productSalesMap.get(item.productName) || 0) + (item.subtotal || 0)
        );
      });
    });
    const chartData = Array.from(productSalesMap.entries()).map(
      ([label, value]) => ({ label, value })
    );
    setProductSalesChartData(chartData);

    const categorySalesMap = new Map<
      string,
      { quantity: number; revenue: number }
    >();
    sales.forEach((sale) => {
      (sale.items || []).forEach((soldItem: any) => {
        const product = products.find((p) => p.id === soldItem.productId);
        const category = product ? product.category : "Desconocida";
        const current = categorySalesMap.get(category) || {
          quantity: 0,
          revenue: 0,
        };
        categorySalesMap.set(category, {
          quantity: current.quantity + (soldItem.quantity || 0),
          revenue: current.revenue + (soldItem.subtotal || 0),
        });
      });
    });

    const categoryRows = Array.from(categorySalesMap.entries()).map(
      ([category, data]) => {
        const percentage =
          totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0;
        return [
          category,
          data.quantity.toString(),
          `$${data.revenue.toFixed(2)}`,
          `${percentage.toFixed(1)}%`,
        ];
      }
    );
    setCategoryTableData((prev) => ({ ...prev, rows: categoryRows }));

    const topProductsMap = new Map<
      string,
      { quantity: number; revenue: number; cost: number }
    >();
    sales.forEach((sale) => {
      (sale.items || []).forEach((soldItem: any) => {
        const product = products.find((p) => p.id === soldItem.productId);
        const unitCost = product ? product.unitCost || 0 : 0;
        const current = topProductsMap.get(soldItem.productName) || {
          quantity: 0,
          revenue: 0,
          cost: 0,
        };
        topProductsMap.set(soldItem.productName, {
          quantity: current.quantity + (soldItem.quantity || 0),
          revenue: current.revenue + (soldItem.subtotal || 0),
          cost: current.cost + unitCost * (soldItem.quantity || 0),
        });
      });
    });

    const topProductsRows = Array.from(topProductsMap.entries())
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(([productName, data]) => {
        const productProfit = data.revenue - data.cost;
        const productMargin =
          data.revenue > 0 ? (productProfit / data.revenue) * 100 : 0;
        return [
          productName,
          data.quantity.toString(),
          `$${data.revenue.toFixed(2)}`,
          `${productMargin.toFixed(1)}%`,
        ];
      });
    setTopProductsTableData((prev) => ({ ...prev, rows: topProductsRows }));

    let totalProductCost = 0;
    let totalRawMaterialCost = 0;

    purchases.forEach((purchase) => {
      (purchase.items || []).forEach((purchasedItem: any) => {
        const product = products.find((p) => p.id === purchasedItem.productId);
        if (product && product.category === "Materia Prima") {
          totalRawMaterialCost +=
            (purchasedItem.quantity || 0) * (purchasedItem.unitCost || 0);
        } else {
          totalProductCost +=
            (purchasedItem.quantity || 0) * (purchasedItem.unitCost || 0);
        }
      });
    });

    const calculatedTotalCosts = totalProductCost + totalRawMaterialCost;
    const costAnalysisRows = [
      [
        "Costo de Productos Vendidos",
        `$${totalProductCost.toFixed(2)}`,
        `${
          calculatedTotalCosts > 0
            ? ((totalProductCost / calculatedTotalCosts) * 100).toFixed(1)
            : 0
        }%`,
      ],
      [
        "Costo de Materias Primas",
        `$${totalRawMaterialCost.toFixed(2)}`,
        `${
          calculatedTotalCosts > 0
            ? ((totalRawMaterialCost / calculatedTotalCosts) * 100).toFixed(1)
            : 0
        }%`,
      ],
      ["Total Costos", `$${calculatedTotalCosts.toFixed(2)}`, "100%"],
    ];
    setCostAnalysisTableData((prev) => ({ ...prev, rows: costAnalysisRows }));

    const inventoryRows = products.map((product) => {
      let status = "✓ Normal";
      if (product.stock <= 5 && product.stock > 0) {
        status = "⚠ Bajo";
      } else if (product.stock === 0) {
        status = "❌ Agotado";
      }
      return [
        product.name,
        product.stock?.toString() ?? "0",
        status,
        `$${((product.stock || 0) * (product.unitCost || 0)).toFixed(2)}`,
      ];
    });
    setInventoryStatusTableData((prev) => ({ ...prev, rows: inventoryRows }));

    setLoadingReports(false);
  }, [sales, purchases, products, period]);

  const generatePdfContent = useCallback(() => {
    const formatDate = (date: Date) =>
      date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    const reportDate = formatDate(new Date());

    const generateDataTableHtml = (data: any) => {
      if (!data || !data.rows || data.rows.length === 0) {
        return `<p>No hay datos disponibles para ${data.title.replace(
          /<[^>]*>?/gm,
          ""
        )}.</p>`;
      }
      const headersHtml = data.headers
        .map(
          (header: string) =>
            `<th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2; text-align: left;">${header}</th>`
        )
        .join("");
      const rowsHtml = data.rows
        .map(
          (row: any[]) => `
            <tr>
                ${row
                  .map(
                    (cell) =>
                      `<td style="padding: 8px; border: 1px solid #ddd;">${cell}</td>`
                  )
                  .join("")}
            </tr>
        `
        )
        .join("");
      return `
            <h3 style="color: #8B4513; margin-top: 20px;">${data.title}</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead><tr>${headersHtml}</tr></thead>
                <tbody>${rowsHtml}</tbody>
            </table>
        `;
    };

    const generateProductSalesChartHtml = (data: any[]) => {
      if (!data || data.length === 0) {
        return `<p>No hay datos de ventas de productos para el gráfico.</p>`;
      }
      const listItems = data
        .map((item) => `<li>${item.label}: $${item.value.toFixed(2)}</li>`)
        .join("");
      return `
            <h3 style="color: #8B4513; margin-top: 20px;">📈 Ventas de Productos por Ingresos</h3>
            <ul style="list-style-type: none; padding: 0;">${listItems}</ul>
        `;
    };

    const htmlContent = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 20px; color: #333; }
            h1, h2, h3 { color: #8B4513; }
            .summary-box {
              background-color: #fdf6e3;
              border: 1px solid #e0c29a;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 20px;
              display: flex;
              flex-wrap: wrap;
              justify-content: space-around;
            }
            .summary-item {
              flex: 1 1 45%;
              margin: 5px;
              padding: 10px;
              background-color: #fff;
              border-radius: 5px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .summary-item .label { font-size: 14px; color: #666; margin-bottom: 5px; }
            .summary-item .value { font-size: 18px; font-weight: bold; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1 style="text-align: center;">Reporte Financiero de CoffeeUrbanTech</h1>
          <p style="text-align: center; color: #666;">Generado el: ${reportDate}</p>
          <p style="text-align: center; color: #666;">Período: ${
            period === "today"
              ? "Hoy"
              : period === "week"
              ? "Esta Semana"
              : period === "month"
              ? "Este Mes"
              : period === "year"
              ? "Este Año"
              : "Todo el Tiempo"
          }</p>

          <h2 style="color: #8B4513;">Resumen Financiero</h2>
          <div class="summary-box">
            <div class="summary-item"><div class="label">Ingresos Totales</div><div class="value">$${reportStats.totalRevenue.toFixed(
              2
            )}</div></div>
            <div class="summary-item"><div class="label">Costos Totales</div><div class="value">$${reportStats.totalCosts.toFixed(
              2
            )}</div></div>
            <div class="summary-item"><div class="label">Transacciones Totales</div><div class="value">${
              reportStats.totalTransactions
            }</div></div>
            <div class="summary-item"><div class="label">Ticket Promedio</div><div class="value">$${reportStats.avgTicket.toFixed(
              2
            )}</div></div>
            <div class="summary-item"><div class="label">Ganancia Neta</div><div class="value">$${reportStats.netProfit.toFixed(
              2
            )}</div></div>
            <div class="summary-item"><div class="label">Margen de Ganancia</div><div class="value">${reportStats.profitMargin.toFixed(
              1
            )}%</div></div>
          </div>

          ${generateProductSalesChartHtml(productSalesChartData)}
          ${generateDataTableHtml(categoryTableData)}
          ${generateDataTableHtml(topProductsTableData)}
          ${generateDataTableHtml(costAnalysisTableData)}
          ${generateDataTableHtml(inventoryStatusTableData)}
        </body>
      </html>
    `;
    return htmlContent;
  }, [
    reportStats,
    productSalesChartData,
    categoryTableData,
    topProductsTableData,
    costAnalysisTableData,
    inventoryStatusTableData,
    period,
  ]);

  const exportPdf = async () => {
    setExportingPdf(true);
    try {
      const html = generatePdfContent();
      const { uri } = await Print.printToFileAsync({ html });
      if (uri) {
        await Sharing.shareAsync(uri, {
          UTI: ".pdf",
          mimeType: "application/pdf",
        });
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
      Alert.alert(
        "Error",
        "No se pudo exportar el PDF. Asegúrate de tener una aplicación para abrir PDFs."
      );
    } finally {
      setExportingPdf(false);
    }
  };

  if (loadingReports) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={{ color: "#8B4513", marginTop: 16 }}>
          Cargando reportes...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View
          style={{
            backgroundColor: "#fff",
            padding: 20,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 4,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              color: "#8B4513",
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 16,
            }}
          >
            Reportes Financieros
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "bold",
              color: "#374151",
              marginBottom: 4,
            }}
          >
            Período
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: "#d1d5db",
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <Picker selectedValue={period} onValueChange={setPeriod}>
              <Picker.Item label="Hoy" value="today" />
              <Picker.Item label="Esta Semana" value="week" />
              <Picker.Item label="Este Mes" value="month" />
              <Picker.Item label="Este Año" value="year" />
            </Picker>
          </View>
          <Pressable
            style={{
              backgroundColor: "#8B4513",
              borderRadius: 8,
              paddingVertical: 12,
              marginBottom: 12,
              opacity: loadingReports ? 0.7 : 1,
            }}
            onPress={() => setLoadingReports(true)}
            disabled={loadingReports}
          >
            <Text
              style={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}
            >
              {loadingReports ? "Cargando..." : "Generar Reporte"}
            </Text>
          </Pressable>
          <Pressable
            style={{
              backgroundColor: "#6b7280",
              borderRadius: 8,
              paddingVertical: 12,
              opacity: exportingPdf || loadingReports ? 0.7 : 1,
            }}
            onPress={exportPdf}
            disabled={exportingPdf || loadingReports}
          >
            <Text
              style={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}
            >
              {exportingPdf ? "Exportando..." : "Exportar PDF"}
            </Text>
          </Pressable>
        </View>
        <ReportSummary {...reportStats} />
        <ProductSalesChart data={productSalesChartData} />
        <DataTable {...categoryTableData} />
        <DataTable {...topProductsTableData} />
        <DataTable {...costAnalysisTableData} />
        <DataTable {...inventoryStatusTableData} />
      </ScrollView>
    </View>
  );
}
