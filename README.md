# Rubik's Cube Tracker

A modern, responsive web application for tracking your Rubik's cube solve times and progress. Built with vanilla HTML, CSS, and JavaScript, this application can be hosted on GitHub Pages without requiring any backend or database.

## Features

### 🎯 Progress Visualization
- **Line graphs** for tracking best single, Ao5, and Ao12 times
- **Performance heatmap** showing solve performance by time of day
- **Time range filters** (7 days, 30 days, 90 days, all time) - affects all charts
- **Chart type selection** (line charts and scatter plots)
- **Real-time updates** as you add new solves
- **WCA-compliant averages** with proper DNF handling
- **EST timezone** for all date/time displays

### 📊 Statistics Dashboard
- **Quick stats** showing your best times at a glance
- **Overall statistics** including total solves, average time, standard deviation
- **Time distribution** histogram showing your solve time patterns
- **Progress over time** chart tracking your improvement

### 📝 Blog & Journal System
- **Create blog posts** with titles, categories, and tags
- **Markdown support** for rich content formatting
- **Post categories**: solves, news, other
- **Tag system** for easy organization and filtering
- **Public/private toggle** for each post
- **Filter posts** by category, tag, or privacy status
- **Edit and delete** existing posts

### 💾 Data Management
- **Local storage** - all data is stored in your browser
- **CSV import** - upload solve data from external sources
- **JSON export/import** - backup and restore your data
- **GitHub integration** - commit your data to your repository
- **No database required** - fully static website
- **Data persistence** - your data stays with you

## Getting Started

### Option 1: GitHub Pages (Recommended)

1. **Fork this repository** to your GitHub account
2. **Enable GitHub Pages**:
   - Go to your forked repository
   - Click on "Settings"
   - Scroll down to "GitHub Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"
3. **Access your website** at `https://yourusername.github.io/RubiksWebsite`

### Option 2: Local Development

1. **Clone or download** the repository
2. **Open `index.html`** in your web browser
3. **Start tracking** your solves!

## How to Use

### Adding Solves

1. Go to the **Dashboard** tab
2. Fill in the solve form:
   - **Time**: Enter your solve time in seconds (e.g., 12.34) or DNF for Did Not Finish
   - **Date**: Select the date and time of your solve (automatically set to EST)
   - **Scramble**: Auto-generated WCA-compliant scramble (click "Generate" for new scramble)
   - **Notes**: Optional notes about the solve
3. Click **"Add Solve"**

**Scramble Generation:**
- **WCA-compliant** 3x3 scrambles (20 moves)
- **Auto-generated** when page loads
- **Click "Generate"** for a new scramble
- **Follows WCA rules**: no same face twice in a row

**DNF Support:**
- **Enter "DNF"** for Did Not Finish solves
- **Properly handled** in average calculations
- **WCA-compliant** DNF rules for Ao5 and Ao12

### Viewing Solve Details

- **Click on any solve** in the Recent Solves section to view details
- **See the scramble sequence** for each solve
- **View solve time, date, notes, and penalty information**
- **Modal popup** shows all solve information in a clean format

### Importing Data

#### CSV Import
1. Prepare a CSV file with the required format
2. Go to the **Dashboard** tab
3. Click **"Import CSV"** and select your file
4. Your solves will be automatically imported

**Supported CSV Formats:**

**New Format (Recommended):**
```csv
No;Time;Comment;Scramble;Date;TimewithPenalty
1;12.34;Great solve!;R U R' U' R' F R F';2024-01-15T10:30:00;12.34
2;14.67;Decent solve;F R U R' U' F';2024-01-15T11:15:00;14.67
```

**Legacy Format:**
```csv
time,date,notes
23.45,2024-01-15T10:30:00,Good solve
25.12,2024-01-15T11:15:00,Slow F2L
22.78,2024-01-15T12:00:00,PB!
```

**CSV Fields Explained:**
- **No**: Solve number/ID
- **Time**: Solve time in seconds
- **Comment**: Notes about the solve
- **Scramble**: The scramble sequence
- **Date**: Date and time of the solve
- **TimewithPenalty**: Time including any penalties (+2, DNF, etc.)

#### JSON Import
1. Go to the **Dashboard** tab
2. Click **"Import JSON"** and select a previously exported JSON file
3. Your data will be restored from the backup

### Creating Blog Posts

1. Go to the **Blog** tab
2. Click **"New Post"**
3. Fill in the form:
   - **Title**: Your post title
   - **Category**: Choose from solves, news, or other
   - **Tags**: Comma-separated tags (e.g., "pb, competition, cfop")
   - **Content**: Write your post using Markdown
   - **Private**: Check if you want the post to be private
4. Click **"Save Post"**

### Markdown Support

The blog system supports Markdown formatting:

```markdown
# Heading 1
## Heading 2

**Bold text**
*Italic text*

- Bullet points
- Another point

1. Numbered list
2. Second item

[Link text](https://example.com)

`inline code`

```code block```
```

## Data Storage

All data is stored locally in your browser using localStorage. This means:

- ✅ **No account required**
- ✅ **No internet connection needed** after initial load
- ✅ **Your data stays private**
- ✅ **Works offline**

⚠️ **Important**: Data is stored per browser/device. If you clear your browser data or switch devices, you'll need to re-import your data.

## Exporting Data

### Using the Website (Recommended)

1. Go to the **Dashboard** tab
2. Use the export buttons:
   - **"Export Solves (JSON)"** - Download solve data as JSON
   - **"Export Solves (CSV)"** - Download solve data as CSV with scramble information
   - **"Export Blog Posts"** - Download only your blog posts
   - **"Export All Data"** - Download everything at once
3. The files will be downloaded to your computer

**CSV Export Features:**
- **Complete solve data** including scrambles and penalties
- **Standard format** compatible with other cubing tools
- **Automatic numbering** and date formatting
- **Ready for external analysis** or backup

### Manual Backup (Advanced)

1. Open your browser's Developer Tools (F12)
2. Go to the **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Find **Local Storage** → your website URL
4. Copy the values for `rubiksSolves` and `rubiksBlogPosts`
5. Save these as JSON files for backup

## GitHub Integration

### Committing Data to Your Repository

1. **Export your data** using the website's export buttons
2. **Add the JSON files** to your repository:
   ```bash
   git add data/rubiks-solves.json
   git add data/rubiks-blog-posts.json
   git commit -m "Update solve data and blog posts"
   git push
   ```
3. **Your data is now backed up** in your GitHub repository!

### Benefits of GitHub Storage

- ✅ **Automatic backups** with every commit
- ✅ **Version history** - see how your times improve over time
- ✅ **Cross-device sync** - import data on any device
- ✅ **Public showcase** - share your progress with others
- ✅ **Data safety** - never lose your solves or posts

## Browser Compatibility

This application works in all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Customization

### Styling
- Edit `styles.css` to customize colors, fonts, and layout
- The design uses CSS Grid and Flexbox for responsive layouts
- Color scheme can be modified in the CSS variables

### Features
- Add new chart types in `script.js`
- Extend the blog system with additional categories
- Add new statistics calculations

## Contributing

Feel free to fork this project and customize it for your needs! Some ideas for improvements:

- Add more chart types (3D charts, radar charts)
- Implement data export functionality
- Add solve method tracking (CFOP, Roux, ZZ, etc.)
- Create solve session management
- Add competition result tracking
- Implement solve time prediction algorithms

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions:

1. Check the browser console for error messages
2. Ensure your browser supports localStorage
3. Try clearing your browser cache
4. Create an issue on the GitHub repository

---

Happy solving! 🧩
