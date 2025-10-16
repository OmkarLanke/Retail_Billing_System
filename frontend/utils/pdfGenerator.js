// Import with fallback for missing dependencies
let jsPDF, html2canvas
try {
  jsPDF = require('jspdf').default || require('jspdf')
  html2canvas = require('html2canvas').default || require('html2canvas')
} catch (error) {
  console.warn('PDF generation dependencies not installed. Please run: npm install jspdf html2canvas')
  jsPDF = null
  html2canvas = null
}

export const generateInvoicePDF = async (invoiceElement, sale) => {
  try {
    if (!jsPDF || !html2canvas) {
      throw new Error('PDF generation dependencies not installed. Please run: npm install jspdf html2canvas')
    }

    // Create canvas from the invoice element
    const canvas = await html2canvas(invoiceElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })

    // Get canvas dimensions
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 295 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    let position = 0

    // Add image to PDF
    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add new pages if content is longer than one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Generate filename
    const invoiceNumber = sale?.invoiceNumber || sale?.id || 'INV'
    const date = new Date().toISOString().split('T')[0]
    const filename = `Invoice_${invoiceNumber}_${date}.pdf`

    // Save the PDF
    pdf.save(filename)
    
    return { success: true, filename }
  } catch (error) {
    console.error('Error generating PDF:', error)
    return { success: false, error: error.message }
  }
}

export const printInvoice = (invoiceElement) => {
  try {
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    
    // Get the HTML content of the invoice
    const invoiceHTML = invoiceElement.outerHTML
    
    // Write the content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tax Invoice</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${invoiceHTML}
        </body>
      </html>
    `)
    
    printWindow.document.close()
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error printing invoice:', error)
    return { success: false, error: error.message }
  }
}
