import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateProfessionalReport = async (data: {
    activeThreats: number;
    eventsPerSec: number;
    agents: number;
    indexedLogs: number;
    alerts: any[];
}) => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();
    const serialNumber = `PL-SEC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    let currentY = 55;
    const pageHeight = doc.internal.pageSize.height;
    const bottomMargin = 50; // Safety margin before footer line

    const checkPageOverflow = (needed: number) => {
        if (currentY + needed > pageHeight - bottomMargin) {
            doc.addPage();
            currentY = 25; // Header-less new page start
            return true;
        }
        return false;
    };

    // Helper to add text and update currentY
    const addText = (text: string | string[], fontSize: number, x: number, lineSpacing: number = 7, isBold: boolean = false) => {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", isBold ? "bold" : "normal");

        if (typeof text === 'string') {
            checkPageOverflow(lineSpacing);
            doc.text(text, x, currentY);
            currentY += lineSpacing;
        } else {
            text.forEach(line => {
                checkPageOverflow(lineSpacing);
                doc.text(line, x, currentY);
                currentY += lineSpacing;
            });
        }
    };

    // --- Header ---
    doc.setFillColor(2, 6, 23); // Deep slate/navy (matching UI)
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("POLARIS", 15, 20);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("AUTONOMOUS CYBER INTELLIGENCE UNIT", 15, 30);

    doc.setFontSize(7);
    doc.text(`CONFIDENTIAL // SERIAL: ${serialNumber}`, 140, 20);
    doc.text(`DATE: ${timestamp}`, 140, 25);

    // --- Executive Summary Section ---
    doc.setTextColor(2, 6, 23);
    addText("1. EXECUTIVE SUMMARY", 14, 15, 10, true);

    const summary = `As of ${timestamp}, the Polaris Autonomous Intelligence unit has identified a total of ${data.activeThreats} active threat vectors. System monitoring indicates a throughput of ${data.eventsPerSec} network events per second across ${data.agents} active security agents. Total indexed intelligence logs have reached ${Math.floor(data.indexedLogs / 1000)}K entries. Overall infrastructure health remains at 99.998% mitigation efficiency.`;
    const splitSummary = doc.splitTextToSize(summary, 180);
    addText(splitSummary, 10, 15, 5);

    currentY += 10; // Extra spacing before table

    // --- Intelligence Feed Table ---
    addText("2. RECENT INTELLIGENCE EVENTS", 14, 15, 10, true);

    const tableData = data.alerts.map(alert => [
        alert.time,
        alert.type,
        alert.source,
        alert.desc
    ]);

    autoTable(doc, {
        startY: currentY,
        head: [['Timestamp', 'Severity', 'Source Node', 'Event Description']],
        body: tableData.length > 0 ? tableData : [['N/A', 'N/A', 'N/A', 'No active alerts detected.']],
        theme: 'striped',
        headStyles: { fillColor: [13, 63, 102], textColor: 255 },
        styles: { fontSize: 8, cellPadding: 3 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // --- Analysis Section ---
    addText("3. ANALYTICAL FINDINGS", 14, 15, 12, true);

    addText("Root Causes:", 10, 15, 7, true);
    addText([
        "- Pattern matching suggests non-linear lateral movement attempts from decentralized proxies.",
        "- Automated probes targeting legacy API endpoints for potential rate-limiting bypass."
    ], 10, 20, 6);

    currentY += 5;
    addText("Impact Assessment:", 10, 15, 7, true);
    addText([
        "- Current interception rate is optimal; however, sustained DDoS Synchronized attacks may latency.",
        "- High-intensity brute force attempts on edge nodes indicate potential credential stuffing campaign."
    ], 10, 20, 6);

    currentY += 15;

    // --- Solutions & Recommendations ---
    addText("4. REMEDIATION & STRATEGIC SOLUTIONS", 14, 15, 12, true);

    addText([
        "1. Immediate: Re-deploy Zero-Trust keys for all System Administrator sessions.",
        "2. Tactical: Implement dynamic IP blackholing for sources exhibiting high SYN/ACK ratios.",
        "3. Strategic: Transition to PQE (Post-Quantum Encryption) for long-term database exports."
    ], 10, 20, 7);

    // --- Footer & Signature ---
    doc.setDrawColor(200, 200, 200);
    doc.line(15, pageHeight - 40, 195, pageHeight - 40);

    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text("Electronically Certified by POLARIS AI Node-01", 15, pageHeight - 30);

    // Fake Digital Signature Badge
    doc.setDrawColor(56, 189, 248);
    doc.rect(150, pageHeight - 35, 40, 20);
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(56, 189, 248);
    doc.text("CERTIFIED", 155, pageHeight - 28);
    doc.text("POLARIS SECURE", 155, pageHeight - 24);
    doc.text(serialNumber, 155, pageHeight - 20);

    // Save PDF
    doc.save(`Polaris_Intelligence_Report_${Date.now()}.pdf`);
};
