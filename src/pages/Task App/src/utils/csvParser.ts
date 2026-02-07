import Papa from 'papaparse';
import { parseISO, isValid, parse } from 'date-fns';
import { UsageData } from '../types';

export const parseCsvData = (csvString: string): Promise<UsageData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvString, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          reject(results.errors);
          return;
        }
        const parsedData: UsageData[] = results.data.map((row: any) => {
          let parsedDate: Date | null = null;
          // Attempt to parse date in common formats
          const dateString = String(row.date);

          // Try DD-MMM-YYYY first
          let tempDate = parse(dateString, 'dd-MMM-yyyy', new Date());
          if (isValid(tempDate)) {
            parsedDate = tempDate;
          } else {
            // Fallback to ISO format and other common date formats
            tempDate = parseISO(dateString);
            if (isValid(tempDate)) {
              parsedDate = tempDate;
            } else {
              // Try MM/DD/YYYY
              tempDate = parse(dateString, 'MM/dd/yyyy', new Date());
              if (isValid(tempDate)) {
                parsedDate = tempDate;
              } else {
                // Try YYYY-MM-DD
                tempDate = parse(dateString, 'yyyy-MM-dd', new Date());
                if (isValid(tempDate)) {
                  parsedDate = tempDate;
                }
              }
            }
          }

          if (!parsedDate) {
            console.warn(`Could not parse date: ${dateString}. Setting to epoch.`);
            parsedDate = new Date(0); // Fallback to epoch if no date can be parsed
          }

          return {
            customer: String(row.customer),
            date: parsedDate.toISOString().split('T')[0], // Store as YYYY-MM-DD string
            totalUsersActive: Number(row["Total users active"]) || 0,
            totalUsersCreated: Number(row["Total users created"]) || 0,
            numberFoldersCreated: Number(row["Number of folders created"]) || 0,
            numberFilesUploaded: Number(row["Number of files uploaded"]) || 0,
            numberFilesViewed: Number(row["Number of files viewed"]) || 0,
            numberFilesEmailShared: Number(row["Number of files email-shared"]) || 0,
            numberFilesDownloaded: Number(row["Number of files downloaded"]) || 0,
            numberWorkflowsCreated: Number(row["Number of workflows created"]) || 0,
            numberTicketsSubmitted: Number(row["Number of tickets submitted"]) || 0,
            numberFormsCreated: Number(row["Number of forms created"]) || 0,
            numberEntriesCreated: Number(row["Number of entries created"]) || 0,
            formType: String(row["Form type"]) || '',
          };
        });
        resolve(parsedData);
      },
      error: (error: any) => {
        reject(error);
      },
    });
  });
};
