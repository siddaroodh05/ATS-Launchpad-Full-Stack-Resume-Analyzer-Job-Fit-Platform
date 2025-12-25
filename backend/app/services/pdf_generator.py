from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from io import BytesIO
from datetime import datetime

def generate_analysis_pdf(
    analysis_id: str,
    ats_score: int,
    strengths: list,
    weaknesses: list,
    suggestions: list
) -> BytesIO:
    buffer = BytesIO()
    # Create the document template
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=50,
        leftMargin=50,
        topMargin=50,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()
    story = []

    # --- Custom Styles ---
    title_style = ParagraphStyle(
        'MainTitle',
        parent=styles['Heading1'],
        fontSize=22,
        textColor=colors.HexColor("#1E3A8A"),
        spaceAfter=12
    )
    
    section_header_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor("#1E40AF"),
        spaceBefore=15,
        spaceAfter=8,
        borderPadding=5,
    )

    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontSize=11,
        leading=14, # Line spacing
        spaceAfter=6
    )

    # --- Header & Metadata ---
    story.append(Paragraph("ATS Resume Analysis Report", title_style))
    story.append(Paragraph(f"<b>Analysis ID:</b> {analysis_id}", styles['Normal']))
    story.append(Paragraph(f"<b>Generated On:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#6366F1"), spaceAfter=20))

    # --- Score Section ---
    score_color = colors.green if ats_score >= 70 else colors.orange if ats_score >= 40 else colors.red
    score_text = f"ATS Compatibility Score: <font color='{score_color}'>{ats_score} / 100</font>"
    story.append(Paragraph(score_text, ParagraphStyle('Score', parent=styles['Heading2'], fontSize=16)))
    story.append(Spacer(1, 10))

    # --- Helper function for list sections ---
    def add_list_section(title, items, bullet_color="#1E3A8A"):
        story.append(Paragraph(title, section_header_style))
        for item in items:
            # Using HTML-like tags for bullets and wrapping
            bullet_item = f"<font color='{bullet_color}'>•</font> {item}"
            story.append(Paragraph(bullet_item, body_style))

    # --- Add Sections ---
    add_list_section("Strengths", strengths)
    add_list_section("Weaknesses", weaknesses)
    add_list_section("Improvement Suggestions", suggestions)

    # --- Footer Construction ---
    def add_footer(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica-Oblique', 8)
        canvas.setFillColor(colors.grey)
        footer_text = f"Page {doc.page} | ATS Analysis System"
        canvas.drawRightString(A4[0] - 50, 30, footer_text)
        canvas.restoreState()

    # Build PDF
    doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)
    
    buffer.seek(0)
    return buffer