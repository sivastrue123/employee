# CSV-Driven Customer Usage Dashboard App

This is a simple, clean, and minimal web application for displaying customer usage data from a CSV file with interactive customer-wise and date-wise filters.

## Features

- **CSV Import Page**: Upload a CSV file containing customer usage metrics.
- **Dynamic Dashboard**: Displays customer usage metrics, automatically updating based on selected filters.
- **Customer Filter**: Filter data by selecting a specific customer from a dropdown.
- **Date Range Filter**: Filter data by selecting a start and end date.
- **Metric Cards**: View key usage metrics as numeric cards.

## CSV Structure

The CSV file should contain the following fields:

- `customer`: Name of the customer
- `date`: Date of the usage data (e.g., `DD-MMM-YYYY`, `YYYY-MM-DD`, `MM/DD/YYYY`)
- `Total users active`: Number of active users
- `Total users created`: Number of users created
- `Number of folders created`: Number of folders created
- `Number of files uploaded`: Number of files uploaded
- `Number of files viewed`: Number of files viewed
- `Number of files email-shared`: Number of files email-shared
- `Number of files downloaded`: Number of files downloaded
- `Number of workflows created`: Number of workflows created
- `Number of tickets submitted`: Number of tickets submitted
- `Number of forms created`: Number of forms created
- `Number of entries created`: Number of entries created
- `Form type`: Type of form (e.g., "master form" or "workflow-connected form")

## Technical Stack

- **Frontend**: React.js with TypeScript
- **Styling**: Tailwind CSS
- **CSV Parsing**: Papaparse
- **Date Management**: `date-fns`
- **State Management**: React Context API
- **Routing**: React Router DOM

## Getting Started

Follow these instructions to set up and run the application locally.

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Installation

1.  **Clone the repository (if applicable) or navigate to the project directory:**
    ```bash
    cd path/to/your/project
    ```

2.  **Install dependencies:**
    ```bash
    npm install --legacy-peer-deps
    ```

### Running the Application

1.  **Start the development server:**
    ```bash
    npm run dev
    ```

2.  **Open your browser:**

    The application will be accessible at `http://localhost:5173` (or another port if 5173 is in use).

## Usage

1.  **Upload CSV**: On the home page, use the "Upload CSV" section to select and upload your customer usage data CSV file. The application will automatically navigate to the dashboard after a successful upload.
2.  **Filter Data**: On the dashboard, use the "Customer" dropdown and "Start Date" / "End Date" pickers to filter the displayed metrics.
3.  **View Metrics**: The numeric cards will dynamically update to show aggregated metrics based on your selected filters.
