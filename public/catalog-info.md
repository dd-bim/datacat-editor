# Catalog Information (Default Template)

## About this Catalog

**Note: This is the default catalog information template.**

In production environments, this content is loaded from an external volume (`./volumes/catalog-info.md`) and can be updated without rebuilding the Docker image.

## Configuration

### Development
- File location: `public/catalog-info.md`
- Edit this file for local development

### Production (Docker)
- File location: `./volumes/catalog-info.md` (mounted as volume)
- Edit the volume file and restart the container to update content

## Content Guidelines

This file supports standard markdown format including:
- Headings (H1-H3) for table of contents
- Lists, tables, links, and formatting
- Code blocks and images

## Features

The catalog information page provides:
- PDF export functionality
- Markdown download
- Print support
- Share options
- Font size controls
- Dark mode toggle
- Interactive table of contents

---

*Replace this content with your actual catalog information.*