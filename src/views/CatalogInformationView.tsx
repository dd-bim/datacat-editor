import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import { Container, Paper, Typography, Box, CircularProgress, Button, Stack } from "@mui/material";
import { Download as DownloadIcon, PictureAsPdf as PdfIcon, Code as MarkdownIcon, Print as PrintIcon, Share as ShareIcon, TextIncrease as FontIncreaseIcon, TextDecrease as FontDecreaseIcon } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import { T, useTolgee } from "@tolgee/react";
import { saveAs } from "file-saver";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useCustomTheme } from "../context/ThemeContext";
import { useTheme } from "@mui/material/styles";

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: "60vh",
}));

const MarkdownContent = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'fontSize',
})<{ fontSize: number }>(({ theme, fontSize }) => ({
  marginTop: theme.spacing(2),
  fontSize: `${fontSize}px`,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  transition: theme.transitions.create(['background-color', 'color', 'border-color', 'fill', 'stroke'], {
    duration: theme.transitions.duration.shorter,
  }),
  "& h1": {
    fontSize: `${fontSize * 1.75}px`,
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  "& h2": {
    fontSize: `${fontSize * 1.5}px`,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1.5),
    color: theme.palette.primary.dark,
  },
  "& h3": {
    fontSize: `${fontSize * 1.25}px`,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    color: theme.palette.text.primary,
  },
  "& p": {
    marginBottom: theme.spacing(1.5),
    fontSize: `${fontSize}px`,
    lineHeight: 1.6,
    color: theme.palette.text.primary,
  },
  "& strong": {
    fontWeight: 'bold',
    color: theme.palette.text.primary,
  },
  "& em": {
    fontStyle: 'italic',
    color: theme.palette.text.secondary,
  },
  "& ul, & ol": {
    paddingLeft: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  "& li": {
    marginBottom: theme.spacing(0.5),
    color: theme.palette.text.primary,
  },
  "& code": {
    backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#f5f5f5',
    color: theme.palette.text.primary,
    padding: '2px 4px',
    borderRadius: '4px',
    fontSize: `${fontSize * 0.9}px`,
    fontFamily: "monospace",
  },
  // Table styles for GFM tables
  "& table": {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
  },
  "& thead": {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
  },
  "& th": {
    padding: theme.spacing(1.5),
    textAlign: 'left',
    fontWeight: 'bold',
    borderBottom: `2px solid ${theme.palette.divider}`,
    borderRight: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    fontSize: `${fontSize}px`,
  },
  "& td": {
    padding: theme.spacing(1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderRight: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    fontSize: `${fontSize}px`,
  },
  "& tr:last-child td": {
    borderBottom: 'none',
  },
  "& th:last-child, & td:last-child": {
    borderRight: 'none',
  },
  "& tbody tr:hover": {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
  },
}));

const LoadingContainer = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "200px",
});

const ErrorContainer = styled(Box)(({ theme }) => ({
  textAlign: "center",
  color: theme.palette.error.main,
  padding: theme.spacing(3),
}));

const ActionButtonsContainer = styled(Stack)(({ theme }) => ({
  position: "sticky",
  top: theme.spacing(2),
  zIndex: 1,
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  marginBottom: theme.spacing(2),
}));

export default function CatalogInformationView() {
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [fontSize, setFontSize] = useState<number>(() => {
    // Load saved font size from localStorage or use default
    const saved = localStorage.getItem('catalog-info-font-size');
    return saved ? parseInt(saved, 10) : 16;
  });
  const tolgee = useTolgee();
  const theme = useTheme();
  const { darkMode } = useCustomTheme();

  // Download original markdown file
  const handleMarkdownDownload = () => {
    if (!markdownContent) return;

    try {
      // Create blob with original markdown content
      const blob = new Blob([markdownContent], { 
        type: "text/markdown;charset=utf-8" 
      });
      
      // Create filename
      const fileName = `Kataloginformationen.md`;
      
      // Save file
      saveAs(blob, fileName);
    } catch (error) {
      console.error("Error downloading markdown file:", error);
      alert("Fehler beim Herunterladen der Markdown-Datei: " + error.message);
    }
  };

  // Print the current page content
  const handlePrint = () => {
    if (!markdownContent) return;

    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Popup wurde blockiert. Bitte erlauben Sie Popups für diese Seite.');
        return;
      }

      // Convert markdown to HTML for printing
      let htmlContent = markdownContent
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

      htmlContent = `<p>${htmlContent}</p>`;

      // Create print document
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Kataloginformationen</title>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              color: #333;
            }
            h1 { 
              font-size: 24px; 
              margin: 30px 0 20px 0; 
              color: #111; 
              border-bottom: 2px solid #eee;
              padding-bottom: 10px;
            }
            h2 { 
              font-size: 20px; 
              margin: 25px 0 15px 0; 
              color: #222; 
            }
            h3 { 
              font-size: 16px; 
              margin: 20px 0 10px 0; 
              color: #333; 
            }
            p { 
              margin: 12px 0; 
            }
            strong { 
              font-weight: bold; 
            }
            em { 
              font-style: italic; 
            }
            @media print {
              body { margin: 0; padding: 15px; }
              h1 { page-break-after: avoid; }
              h2, h3 { page-break-after: avoid; }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    } catch (error) {
      console.error("Error printing:", error);
      alert("Fehler beim Drucken: " + error.message);
    }
  };

  // Share the current page
  const handleShare = async () => {
    try {
      const shareData = {
        title: 'DataCat - Kataloginformationen',
        text: 'Schaue dir diese Kataloginformationen an',
        url: window.location.href
      };

      // Check if Web Share API is supported
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('URL wurde in die Zwischenablage kopiert!');
      }
    } catch (error) {
      // If sharing fails, try clipboard as fallback
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('URL wurde in die Zwischenablage kopiert!');
      } catch (clipboardError) {
        console.error("Error sharing:", error);
        alert('Teilen nicht möglich. URL: ' + window.location.href);
      }
    }
  };

  // Font size controls
  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 2, 24); // Max 24px
    setFontSize(newSize);
    localStorage.setItem('catalog-info-font-size', newSize.toString());
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 2, 12); // Min 12px
    setFontSize(newSize);
    localStorage.setItem('catalog-info-font-size', newSize.toString());
  };

  // Convert content to PDF
  const handlePdfDownload = async () => {
    if (!markdownContent) return;

    try {
      setPdfGenerating(true);
      
      // Create a temporary div with the content for PDF generation
      const tempDiv = document.createElement('div');
      tempDiv.style.width = '800px';
      tempDiv.style.padding = '40px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '14px';
      tempDiv.style.lineHeight = '1.6';
      tempDiv.style.color = '#000';
      tempDiv.style.backgroundColor = '#fff';
      
      // Convert markdown to HTML with proper formatting
      let htmlContent = markdownContent
        // Convert headings
        .replace(/^### (.+)$/gm, '<h3 style="font-size: 16px; font-weight: bold; margin: 20px 0 10px 0; color: #333;">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 style="font-size: 18px; font-weight: bold; margin: 25px 0 15px 0; color: #222;">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 style="font-size: 20px; font-weight: bold; margin: 30px 0 20px 0; color: #111;">$1</h1>')
        // Convert bold and italic
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Convert line breaks and paragraphs
        .replace(/\n\n/g, '</p><p style="margin: 12px 0;">')
        .replace(/\n/g, '<br>');
      
      // Wrap in paragraph tags
      htmlContent = `<p style="margin: 12px 0;">${htmlContent}</p>`;
      
      // Fix empty paragraphs
      htmlContent = htmlContent.replace(/<p[^>]*><\/p>/g, '');
      
      tempDiv.innerHTML = htmlContent;

      // Temporarily add to DOM for rendering
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      document.body.appendChild(tempDiv);

      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        width: 800,
        scale: 2, // Higher quality
        useCORS: true
      });

      // Remove temp div
      document.body.removeChild(tempDiv);

      // Create PDF with multi-page support
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 10;
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = margin;

      // Add first page
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - margin);

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Create filename with current language
      const fileName = `Kataloginformationen.pdf`;
      
      // Save PDF
      pdf.save(fileName);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Fehler beim Generieren der PDF: " + error.message);
    } finally {
      setPdfGenerating(false);
    }
  };

  useEffect(() => {
    const fetchCatalogInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load single markdown file from environment variable or default
        // In Docker: VITE_CATALOG_INFO_PATH could be '/volumes/catalog-info.md'
        // In Dev: defaults to '/catalog-info.md' (from public folder)
        const catalogInfoPath = import.meta.env.VITE_CATALOG_INFO_PATH || '/catalog-info.md';
        
        // Fetch the markdown content
        const response = await fetch(catalogInfoPath);
        
        if (!response.ok) {
          throw new Error(`Failed to load catalog information: ${response.status} ${response.statusText}`);
        }
        
        const content = await response.text();
        setMarkdownContent(content);
      } catch (err) {
        console.error("Error loading catalog information:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogInfo();
  }, []); // Only load once on component mount

  return (
    <>
      <StyledContainer maxWidth={false} sx={{ width: '100%', padding: 3 }}>
      <StyledPaper variant="outlined">
        {/* Only show title when loading, error, or no content */}
        {(loading || error || (!loading && !error && !markdownContent)) && (
          <Typography variant="h4" component="h1" gutterBottom>
            <T keyName="catalog_info.title">Kataloginformationen</T>
          </Typography>
        )}
        
        {loading && (
          <LoadingContainer>
            <CircularProgress />
          </LoadingContainer>
        )}
        
        {error && (
          <ErrorContainer>
            <Typography variant="h6" gutterBottom>
              <T keyName="catalog_info.error_title">Fehler beim Laden der Kataloginformationen</T>
            </Typography>
            <Typography variant="body2">
              {error}
            </Typography>
          </ErrorContainer>
        )}
        
        {!loading && !error && markdownContent && (
          <>
            <ActionButtonsContainer direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                transition: 'all 0.2s ease-in-out'
              }}>
                {/* Font Size Controls */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  transition: 'all 0.2s ease-in-out'
                }}>
                  <Typography variant="body2" color="text.secondary">
                    <T keyName="catalog_info.font_size">Schriftgröße:</T>
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={decreaseFontSize}
                    disabled={fontSize <= 12}
                    sx={{ minWidth: 'auto', p: 0.5 }}
                  >
                    <FontDecreaseIcon fontSize="small" />
                  </Button>
                  <Typography variant="body2" sx={{ mx: 1, minWidth: '40px', textAlign: 'center' }}>
                    {fontSize}px
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={increaseFontSize}
                    disabled={fontSize >= 24}
                    sx={{ minWidth: 'auto', p: 0.5 }}
                  >
                    <FontIncreaseIcon fontSize="small" />
                  </Button>
                </Box>
              </Box>

              {/* Right Side: Download, Print, Share Buttons */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                transition: 'all 0.2s ease-in-out'
              }}>
                <Button
                  variant="outlined"
                  startIcon={<PdfIcon />}
                  onClick={handlePdfDownload}
                  disabled={pdfGenerating}
                  size="small"
                >
                  <T keyName="catalog_info.download_pdf">
                    {pdfGenerating ? "Generiere PDF..." : "Als PDF herunterladen"}
                  </T>
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<MarkdownIcon />}
                  onClick={handleMarkdownDownload}
                  size="small"
                >
                  <T keyName="catalog_info.download_md">Als Markdown herunterladen</T>
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  size="small"
                >
                  <T keyName="catalog_info.print">Drucken</T>
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  onClick={handleShare}
                  size="small"
                >
                  <T keyName="catalog_info.share">Teilen</T>
                </Button>
              </Box>
            </ActionButtonsContainer>
            
            <MarkdownContent fontSize={fontSize} key={`markdown-${darkMode}`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children, ...props }) => {
                    const text = children?.toString() || '';
                    const id = `heading-${text.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
                    return <h1 {...props} id={id}>{children}</h1>;
                  },
                  h2: ({ children, ...props }) => {
                    const text = children?.toString() || '';
                    const id = `heading-${text.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
                    return <h2 {...props} id={id}>{children}</h2>;
                  },
                  h3: ({ children, ...props }) => {
                    const text = children?.toString() || '';
                    const id = `heading-${text.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
                    return <h3 {...props} id={id}>{children}</h3>;
                  },
                }}
              >
                {markdownContent}
              </ReactMarkdown>
            </MarkdownContent>
          </>
        )}
        
        {!loading && !error && !markdownContent && (
          <ErrorContainer>
            <Typography variant="body1">
              <T keyName="catalog_info.no_content">Keine Kataloginformationen verfügbar.</T>
            </Typography>
          </ErrorContainer>
        )}
      </StyledPaper>
      </StyledContainer>
    </>
  );
}