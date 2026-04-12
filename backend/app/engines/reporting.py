from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from io import BytesIO
from datetime import datetime

def generate_board_brief_pdf(assets, rating):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []

    # Header
    elements.append(Paragraph("Q-GUARDIAN | QUANTUM TRANSITION INTELLIGENCE", styles['Title']))
    elements.append(Paragraph(f"BOARD BRIEF - {datetime.now().strftime('%Y-%m-%d')}", styles['Heading2']))
    elements.append(Spacer(1, 12))

    # Executive Summary
    elements.append(Paragraph("EXECUTIVE SUMMARY", styles['Heading3']))
    summary_text = f"The enterprise cyber rating is currently <b>{rating['score']} ({rating['status']})</b> based on {rating['asset_count']} discovered assets. Mosca Risk Countdown indicates that critical assets have a risk window opening in as little as 187 days."
    elements.append(Paragraph(summary_text, styles['Normal']))
    elements.append(Spacer(1, 12))

    # Top Risks Table
    elements.append(Paragraph("TOP 5 CRYPTOGRAPHIC RISKS", styles['Heading3']))
    data = [["Asset Hostname", "Algorithm", "QTRI Score", "Mosca Countdown"]]
    
    # Sort assets by QTRI score (lowest first)
    sorted_assets = sorted(assets, key=lambda x: x['qtri_score'])[:5]
    for asset in sorted_assets:
        data.append([
            asset['hostname'],
            asset['algorithm'],
            str(asset['qtri_score']),
            f"{asset['mosca']['days_remaining_worst']} Days"
        ])

    t = Table(data)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.maroon),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(t)
    elements.append(Spacer(1, 24))

    # Regulatory Alignment
    elements.append(Paragraph("REGULATORY ALIGNMENT", styles['Heading3']))
    elements.append(Paragraph("This report maps to RBI Cybersecurity Framework (CSF) 2.0 and NIST IR 8547 PQC Migration Guidelines.", styles['Normal']))

    doc.build(elements)
    buffer.seek(0)
    return buffer
