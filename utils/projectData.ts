// export type Project = {
//   id: string;
//   projectName: string;
//   status: "ongoing" | "completed" | "on-hold" | "dropped" | "planning";
//   projectDescription: string;
//   totalMembers: number;
//   progress: number;
//   startDate: string | Date;
//   endDate: string | Date | null;
//   manager: {
//     id: string;
//     name: string;
//     email: string;
//     imgSrc: string;
//   };
//   teamMembers: Array<{
//     name: string;
//     imgSrc: string;
//   }>;

//   budget: {
//     allocated: number;
//     spent: number;
//   };

//   lastUpdated: string | Date;
//   createdOn: string | Date;
//   createdBy: {
//     id: string;
//     name: string;
//     email: string;
//   };
// };

// export const ProjectData: Project[] = [
//   {
//     id: "proj-001",
//     projectName: "Corporate Website Redesign (1)",
//     status: "ongoing",
//     projectDescription:
//       "A complete redesign of the company's corporate website to reflect a new brand identity.",
//     totalMembers: 6,
//     progress: 51,
//     startDate: "2025-02-07T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m1",
//       name: "Alice Johnson",
//       email: "alice.j@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=a",
//     },
//     teamMembers: [
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//     ],
//     budget: {
//       allocated: 96363,
//       spent: 79891,
//     },
//     lastUpdated: "2025-08-14T10:54:01.332312",
//     createdOn: "2025-02-07T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-002",
//     projectName: "Cloud Migration Project (2)",
//     status: "ongoing",
//     projectDescription:
//       "Building a real-time data visualization dashboard for key business metrics.",
//     totalMembers: 9,
//     progress: 54,
//     startDate: "2024-09-04T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m1",
//       name: "Alice Johnson",
//       email: "alice.j@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=a",
//     },
//     teamMembers: [
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//     ],
//     budget: {
//       allocated: 480445,
//       spent: 195594,
//     },
//     lastUpdated: "2025-08-11T10:54:01.332312",
//     createdOn: "2024-09-04T10:54:01.332312",
//     createdBy: {
//       id: "c1",
//       name: "Admin User",
//       email: "admin@example.com",
//     },
//   },
//   {
//     id: "proj-003",
//     projectName: "E-commerce Platform Relaunch (3)",
//     status: "completed",
//     projectDescription:
//       "Automating our email and social media marketing campaigns.",
//     totalMembers: 10,
//     progress: 13,
//     startDate: "2025-03-24T10:54:01.332312",
//     endDate: "2025-11-07T10:54:01.332312",
//     manager: {
//       id: "m4",
//       name: "Diana Prince",
//       email: "diana.p@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=d",
//     },
//     teamMembers: [],
//     budget: {
//       allocated: 105194,
//       spent: 335846,
//     },
//     lastUpdated: "2025-08-05T10:54:01.332312",
//     createdOn: "2025-03-24T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-004",
//     projectName: "Data Analytics Dashboard (4)",
//     status: "on-hold",
//     projectDescription:
//       "Creating a new portal for customers to submit and track feedback.",
//     totalMembers: 5,
//     progress: 96,
//     startDate: "2024-11-24T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m4",
//       name: "Diana Prince",
//       email: "diana.p@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=d",
//     },
//     teamMembers: [
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//     ],
//     budget: {
//       allocated: 215584,
//       spent: 378227,
//     },
//     lastUpdated: "2025-08-02T10:54:01.332312",
//     createdOn: "2024-11-24T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-005",
//     projectName: "Internal CMS Upgrade (5)",
//     status: "ongoing",
//     projectDescription:
//       "Migrating all company data and services to a new cloud infrastructure.",
//     totalMembers: 3,
//     progress: 62,
//     startDate: "2024-10-23T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m1",
//       name: "Alice Johnson",
//       email: "alice.j@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=a",
//     },
//     teamMembers: [
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//     ],
//     budget: {
//       allocated: 123010,
//       spent: 402286,
//     },
//     lastUpdated: "2025-08-01T10:54:01.332312",
//     createdOn: "2024-10-23T10:54:01.332312",
//     createdBy: {
//       id: "c1",
//       name: "Admin User",
//       email: "admin@example.com",
//     },
//   },
//   {
//     id: "proj-006",
//     projectName: "Mobile App Development (6)",
//     status: "dropped",
//     projectDescription:
//       "Developing a new mobile application for both iOS and Android platforms.",
//     totalMembers: 4,
//     progress: 59,
//     startDate: "2025-04-11T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m4",
//       name: "Diana Prince",
//       email: "diana.p@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=d",
//     },
//     teamMembers: [
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//     ],
//     budget: {
//       allocated: 179120,
//       spent: 256175,
//     },
//     lastUpdated: "2025-08-05T10:54:01.332312",
//     createdOn: "2025-04-11T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-007",
//     projectName: "Cloud Migration Project (7)",
//     status: "dropped",
//     projectDescription:
//       "Automating our email and social media marketing campaigns.",
//     totalMembers: 6,
//     progress: 61,
//     startDate: "2025-01-07T10:54:01.332312",
//     endDate: "2025-02-18T10:54:01.332312",
//     manager: {
//       id: "m2",
//       name: "Bob Williams",
//       email: "bob.w@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=b",
//     },
//     teamMembers: [
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//     ],
//     budget: {
//       allocated: 238693,
//       spent: 235543,
//     },
//     lastUpdated: "2025-07-16T10:54:01.332312",
//     createdOn: "2025-01-07T10:54:01.332312",
//     createdBy: {
//       id: "c1",
//       name: "Admin User",
//       email: "admin@example.com",
//     },
//   },
//   {
//     id: "proj-008",
//     projectName: "Corporate Website Redesign (8)",
//     status: "planning",
//     projectDescription:
//       "Upgrading our internal content management system for better scalability and security.",
//     totalMembers: 15,
//     progress: 39,
//     startDate: "2024-11-05T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m1",
//       name: "Alice Johnson",
//       email: "alice.j@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=a",
//     },
//     teamMembers: [
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//     ],
//     budget: {
//       allocated: 329269,
//       spent: 150599,
//     },
//     lastUpdated: "2025-07-19T10:54:01.332312",
//     createdOn: "2024-11-05T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-009",
//     projectName: "Internal CMS Upgrade (9)",
//     status: "dropped",
//     projectDescription:
//       "A complete redesign of the company's corporate website to reflect a new brand identity.",
//     totalMembers: 11,
//     progress: 33,
//     startDate: "2024-09-05T10:54:01.332312",
//     endDate: "2024-10-12T10:54:01.332312",
//     manager: {
//       id: "m2",
//       name: "Bob Williams",
//       email: "bob.w@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=b",
//     },
//     teamMembers: [
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//     ],
//     budget: {
//       allocated: 277655,
//       spent: 139844,
//     },
//     lastUpdated: "2025-08-08T10:54:01.332312",
//     createdOn: "2024-09-05T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-010",
//     projectName: "Supply Chain Optimization (10)",
//     status: "planning",
//     projectDescription:
//       "Creating a new portal for customers to submit and track feedback.",
//     totalMembers: 10,
//     progress: 19,
//     startDate: "2024-10-04T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m3",
//       name: "Charlie Brown",
//       email: "charlie.b@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=c",
//     },
//     teamMembers: [
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//     ],
//     budget: {
//       allocated: 87906,
//       spent: 195608,
//     },
//     lastUpdated: "2025-07-18T10:54:01.332312",
//     createdOn: "2024-10-04T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-011",
//     projectName: "Marketing Campaign Automation (11)",
//     status: "on-hold",
//     projectDescription:
//       "A complete redesign of the company's corporate website to reflect a new brand identity.",
//     totalMembers: 7,
//     progress: 35,
//     startDate: "2025-06-26T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m2",
//       name: "Bob Williams",
//       email: "bob.w@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=b",
//     },
//     teamMembers: [
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//     ],
//     budget: {
//       allocated: 363122,
//       spent: 401558,
//     },
//     lastUpdated: "2025-07-24T10:54:01.332312",
//     createdOn: "2025-06-26T10:54:01.332312",
//     createdBy: {
//       id: "c1",
//       name: "Admin User",
//       email: "admin@example.com",
//     },
//   },
//   {
//     id: "proj-012",
//     projectName: "Customer Feedback Portal (12)",
//     status: "planning",
//     projectDescription:
//       "Integrating an AI-powered chatbot into our customer support system.",
//     totalMembers: 11,
//     progress: 18,
//     startDate: "2025-05-15T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m4",
//       name: "Diana Prince",
//       email: "diana.p@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=d",
//     },
//     teamMembers: [
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//     ],
//     budget: {
//       allocated: 249864,
//       spent: 342584,
//     },
//     lastUpdated: "2025-08-04T10:54:01.332312",
//     createdOn: "2025-05-15T10:54:01.332312",
//     createdBy: {
//       id: "c1",
//       name: "Admin User",
//       email: "admin@example.com",
//     },
//   },
//   {
//     id: "proj-013",
//     projectName: "Marketing Campaign Automation (13)",
//     status: "dropped",
//     projectDescription:
//       "A complete redesign of the company's corporate website to reflect a new brand identity.",
//     totalMembers: 8,
//     progress: 57,
//     startDate: "2025-02-09T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m3",
//       name: "Charlie Brown",
//       email: "charlie.b@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=c",
//     },
//     teamMembers: [
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//     ],
//     budget: {
//       allocated: 311446,
//       spent: 167154,
//     },
//     lastUpdated: "2025-08-14T10:54:01.332312",
//     createdOn: "2025-02-09T10:54:01.332312",
//     createdBy: {
//       id: "c1",
//       name: "Admin User",
//       email: "admin@example.com",
//     },
//   },
//   {
//     id: "proj-014",
//     projectName: "Corporate Website Redesign (14)",
//     status: "planning",
//     projectDescription:
//       "Building a real-time data visualization dashboard for key business metrics.",
//     totalMembers: 11,
//     progress: 95,
//     startDate: "2025-03-29T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m2",
//       name: "Bob Williams",
//       email: "bob.w@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=b",
//     },
//     teamMembers: [
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//     ],
//     budget: {
//       allocated: 205366,
//       spent: 64022,
//     },
//     lastUpdated: "2025-07-20T10:54:01.332312",
//     createdOn: "2025-03-29T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-015",
//     projectName: "Data Analytics Dashboard (15)",
//     status: "completed",
//     projectDescription:
//       "A complete redesign of the company's corporate website to reflect a new brand identity.",
//     totalMembers: 13,
//     progress: 31,
//     startDate: "2024-09-15T10:54:01.332312",
//     endDate: "2024-11-12T10:54:01.332312",
//     manager: {
//       id: "m3",
//       name: "Charlie Brown",
//       email: "charlie.b@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=c",
//     },
//     teamMembers: [
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//     ],
//     budget: {
//       allocated: 200240,
//       spent: 415200,
//     },
//     lastUpdated: "2025-08-01T10:54:01.332312",
//     createdOn: "2024-09-15T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-016",
//     projectName: "Internal CMS Upgrade (16)",
//     status: "on-hold",
//     projectDescription:
//       "Creating a new portal for customers to submit and track feedback.",
//     totalMembers: 6,
//     progress: 78,
//     startDate: "2024-12-16T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m3",
//       name: "Charlie Brown",
//       email: "charlie.b@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=c",
//     },
//     teamMembers: [
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//     ],
//     budget: {
//       allocated: 203378,
//       spent: 95599,
//     },
//     lastUpdated: "2025-08-03T10:54:01.332312",
//     createdOn: "2024-12-16T10:54:01.332312",
//     createdBy: {
//       id: "c1",
//       name: "Admin User",
//       email: "admin@example.com",
//     },
//   },
//   {
//     id: "proj-017",
//     projectName: "Marketing Campaign Automation (17)",
//     status: "completed",
//     projectDescription:
//       "Upgrading our internal content management system for better scalability and security.",
//     totalMembers: 13,
//     progress: 42,
//     startDate: "2025-05-18T10:54:01.332312",
//     endDate: "2025-09-19T10:54:01.332312",
//     manager: {
//       id: "m3",
//       name: "Charlie Brown",
//       email: "charlie.b@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=c",
//     },
//     teamMembers: [
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//     ],
//     budget: {
//       allocated: 97482,
//       spent: 449694,
//     },
//     lastUpdated: "2025-08-01T10:54:01.332312",
//     createdOn: "2025-05-18T10:54:01.332312",
//     createdBy: {
//       id: "c1",
//       name: "Admin User",
//       email: "admin@example.com",
//     },
//   },
//   {
//     id: "proj-018",
//     projectName: "Mobile App Development (18)",
//     status: "planning",
//     projectDescription:
//       "A complete redesign of the company's corporate website to reflect a new brand identity.",
//     totalMembers: 7,
//     progress: 52,
//     startDate: "2025-06-19T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m4",
//       name: "Diana Prince",
//       email: "diana.p@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=d",
//     },
//     teamMembers: [
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//     ],
//     budget: {
//       allocated: 451970,
//       spent: 67882,
//     },
//     lastUpdated: "2025-08-03T10:54:01.332312",
//     createdOn: "2025-06-19T10:54:01.332312",
//     createdBy: {
//       id: "c1",
//       name: "Admin User",
//       email: "admin@example.com",
//     },
//   },
//   {
//     id: "proj-019",
//     projectName: "E-commerce Platform Relaunch (19)",
//     status: "ongoing",
//     projectDescription:
//       "A complete redesign of the company's corporate website to reflect a new brand identity.",
//     totalMembers: 3,
//     progress: 61,
//     startDate: "2025-03-16T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m2",
//       name: "Bob Williams",
//       email: "bob.w@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=b",
//     },
//     teamMembers: [
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//     ],
//     budget: {
//       allocated: 256321,
//       spent: 183342,
//     },
//     lastUpdated: "2025-08-09T10:54:01.332312",
//     createdOn: "2025-03-16T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-020",
//     projectName: "Marketing Campaign Automation (20)",
//     status: "planning",
//     projectDescription:
//       "A complete redesign of the company's corporate website to reflect a new brand identity.",
//     totalMembers: 10,
//     progress: 66,
//     startDate: "2024-11-05T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m2",
//       name: "Bob Williams",
//       email: "bob.w@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=b",
//     },
//     teamMembers: [
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//     ],
//     budget: {
//       allocated: 261449,
//       spent: 318554,
//     },
//     lastUpdated: "2025-08-10T10:54:01.332312",
//     createdOn: "2024-11-05T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-021",
//     projectName: "Internal CMS Upgrade (21)",
//     status: "planning",
//     projectDescription:
//       "Upgrading our internal content management system for better scalability and security.",
//     totalMembers: 9,
//     progress: 80,
//     startDate: "2024-12-10T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m2",
//       name: "Bob Williams",
//       email: "bob.w@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=b",
//     },
//     teamMembers: [
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//     ],
//     budget: {
//       allocated: 464807,
//       spent: 258921,
//     },
//     lastUpdated: "2025-08-08T10:54:01.332312",
//     createdOn: "2024-12-10T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-022",
//     projectName: "Mobile App Development (22)",
//     status: "planning",
//     projectDescription:
//       "Building a real-time data visualization dashboard for key business metrics.",
//     totalMembers: 11,
//     progress: 90,
//     startDate: "2025-01-04T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m2",
//       name: "Bob Williams",
//       email: "bob.w@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=b",
//     },
//     teamMembers: [
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//     ],
//     budget: {
//       allocated: 119363,
//       spent: 260414,
//     },
//     lastUpdated: "2025-07-17T10:54:01.332312",
//     createdOn: "2025-01-04T10:54:01.332312",
//     createdBy: {
//       id: "c1",
//       name: "Admin User",
//       email: "admin@example.com",
//     },
//   },
//   {
//     id: "proj-023",
//     projectName: "Corporate Website Redesign (23)",
//     status: "ongoing",
//     projectDescription:
//       "Upgrading our internal content management system for better scalability and security.",
//     totalMembers: 6,
//     progress: 65,
//     startDate: "2024-12-06T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m4",
//       name: "Diana Prince",
//       email: "diana.p@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=d",
//     },
//     teamMembers: [
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//     ],
//     budget: {
//       allocated: 352736,
//       spent: 121755,
//     },
//     lastUpdated: "2025-07-31T10:54:01.332312",
//     createdOn: "2024-12-06T10:54:01.332312",
//     createdBy: {
//       id: "c1",
//       name: "Admin User",
//       email: "admin@example.com",
//     },
//   },
//   {
//     id: "proj-024",
//     projectName: "Internal CMS Upgrade (24)",
//     status: "completed",
//     projectDescription:
//       "A complete redesign of the company's corporate website to reflect a new brand identity.",
//     totalMembers: 10,
//     progress: 52,
//     startDate: "2025-06-26T10:54:01.332312",
//     endDate: "2025-11-22T10:54:01.332312",
//     manager: {
//       id: "m3",
//       name: "Charlie Brown",
//       email: "charlie.b@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=c",
//     },
//     teamMembers: [
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//     ],
//     budget: {
//       allocated: 130700,
//       spent: 240318,
//     },
//     lastUpdated: "2025-08-04T10:54:01.332312",
//     createdOn: "2025-06-26T10:54:01.332312",
//     createdBy: {
//       id: "c1",
//       name: "Admin User",
//       email: "admin@example.com",
//     },
//   },
//   {
//     id: "proj-025",
//     projectName: "Customer Feedback Portal (25)",
//     status: "on-hold",
//     projectDescription:
//       "Automating our email and social media marketing campaigns.",
//     totalMembers: 5,
//     progress: 50,
//     startDate: "2025-05-01T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m3",
//       name: "Charlie Brown",
//       email: "charlie.b@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=c",
//     },
//     teamMembers: [
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//     ],
//     budget: {
//       allocated: 120718,
//       spent: 426775,
//     },
//     lastUpdated: "2025-07-30T10:54:01.332312",
//     createdOn: "2025-05-01T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-026",
//     projectName: "AI Chatbot Integration (26)",
//     status: "ongoing",
//     projectDescription:
//       "Creating a new portal for customers to submit and track feedback.",
//     totalMembers: 8,
//     progress: 19,
//     startDate: "2024-08-18T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m4",
//       name: "Diana Prince",
//       email: "diana.p@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=d",
//     },
//     teamMembers: [
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//     ],
//     budget: {
//       allocated: 65606,
//       spent: 317641,
//     },
//     lastUpdated: "2025-07-23T10:54:01.332312",
//     createdOn: "2024-08-18T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-027",
//     projectName: "Data Analytics Dashboard (27)",
//     status: "completed",
//     projectDescription:
//       "A complete redesign of the company's corporate website to reflect a new brand identity.",
//     totalMembers: 10,
//     progress: 68,
//     startDate: "2025-06-07T10:54:01.332312",
//     endDate: "2026-01-09T10:54:01.332312",
//     manager: {
//       id: "m2",
//       name: "Bob Williams",
//       email: "bob.w@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=b",
//     },
//     teamMembers: [
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//     ],
//     budget: {
//       allocated: 420674,
//       spent: 271259,
//     },
//     lastUpdated: "2025-07-17T10:54:01.332312",
//     createdOn: "2025-06-07T10:54:01.332312",
//     createdBy: {
//       id: "c1",
//       name: "Admin User",
//       email: "admin@example.com",
//     },
//   },
//   {
//     id: "proj-028",
//     projectName: "E-commerce Platform Relaunch (28)",
//     status: "on-hold",
//     projectDescription:
//       "Developing a new mobile application for both iOS and Android platforms.",
//     totalMembers: 4,
//     progress: 40,
//     startDate: "2025-06-02T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m4",
//       name: "Diana Prince",
//       email: "diana.p@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=d",
//     },
//     teamMembers: [
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//     ],
//     budget: {
//       allocated: 426572,
//       spent: 318431,
//     },
//     lastUpdated: "2025-08-08T10:54:01.332312",
//     createdOn: "2025-06-02T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-029",
//     projectName: "Data Analytics Dashboard (29)",
//     status: "dropped",
//     projectDescription:
//       "Building a real-time data visualization dashboard for key business metrics.",
//     totalMembers: 6,
//     progress: 91,
//     startDate: "2025-07-05T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m4",
//       name: "Diana Prince",
//       email: "diana.p@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=d",
//     },
//     teamMembers: [
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//     ],
//     budget: {
//       allocated: 190087,
//       spent: 281738,
//     },
//     lastUpdated: "2025-08-05T10:54:01.332312",
//     createdOn: "2025-07-05T10:54:01.332312",
//     createdBy: {
//       id: "c1",
//       name: "Admin User",
//       email: "admin@example.com",
//     },
//   },
//   {
//     id: "proj-030",
//     projectName: "Customer Feedback Portal (30)",
//     status: "completed",
//     projectDescription:
//       "A complete overhaul of our existing e-commerce site to improve user experience and performance.",
//     totalMembers: 8,
//     progress: 80,
//     startDate: "2025-07-01T10:54:01.332312",
//     endDate: "2026-02-22T10:54:01.332312",
//     manager: {
//       id: "m1",
//       name: "Alice Johnson",
//       email: "alice.j@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=a",
//     },
//     teamMembers: [
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//     ],
//     budget: {
//       allocated: 105355,
//       spent: 123390,
//     },
//     lastUpdated: "2025-07-28T10:54:01.332312",
//     createdOn: "2025-07-01T10:54:01.332312",
//     createdBy: {
//       id: "c1",
//       name: "Admin User",
//       email: "admin@example.com",
//     },
//   },
//   {
//     id: "proj-031",
//     projectName: "Supply Chain Optimization (31)",
//     status: "dropped",
//     projectDescription:
//       "Upgrading our internal content management system for better scalability and security.",
//     totalMembers: 6,
//     progress: 15,
//     startDate: "2025-01-29T10:54:01.332312",
//     endDate: "2025-03-18T10:54:01.332312",
//     manager: {
//       id: "m2",
//       name: "Bob Williams",
//       email: "bob.w@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=b",
//     },
//     teamMembers: [
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//     ],
//     budget: {
//       allocated: 84086,
//       spent: 206779,
//     },
//     lastUpdated: "2025-08-07T10:54:01.332312",
//     createdOn: "2025-01-29T10:54:01.332312",
//     createdBy: {
//       id: "c1",
//       name: "Admin User",
//       email: "admin@example.com",
//     },
//   },
//   {
//     id: "proj-032",
//     projectName: "Mobile App Development (32)",
//     status: "ongoing",
//     projectDescription:
//       "Automating our email and social media marketing campaigns.",
//     totalMembers: 10,
//     progress: 37,
//     startDate: "2025-06-01T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m2",
//       name: "Bob Williams",
//       email: "bob.w@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=b",
//     },
//     teamMembers: [
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//     ],
//     budget: {
//       allocated: 282819,
//       spent: 89473,
//     },
//     lastUpdated: "2025-07-25T10:54:01.332312",
//     createdOn: "2025-06-01T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-033",
//     projectName: "Supply Chain Optimization (33)",
//     status: "ongoing",
//     projectDescription:
//       "Building a real-time data visualization dashboard for key business metrics.",
//     totalMembers: 10,
//     progress: 26,
//     startDate: "2025-05-12T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m4",
//       name: "Diana Prince",
//       email: "diana.p@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=d",
//     },
//     teamMembers: [
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//     ],
//     budget: {
//       allocated: 483953,
//       spent: 425074,
//     },
//     lastUpdated: "2025-07-21T10:54:01.332312",
//     createdOn: "2025-05-12T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-034",
//     projectName: "Cloud Migration Project (34)",
//     status: "dropped",
//     projectDescription:
//       "Automating our email and social media marketing campaigns.",
//     totalMembers: 4,
//     progress: 11,
//     startDate: "2024-10-07T10:54:01.332312",
//     endDate: "2024-12-03T10:54:01.332312",
//     manager: {
//       id: "m3",
//       name: "Charlie Brown",
//       email: "charlie.b@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=c",
//     },
//     teamMembers: [
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//     ],
//     budget: {
//       allocated: 459521,
//       spent: 224702,
//     },
//     lastUpdated: "2025-08-03T10:54:01.332312",
//     createdOn: "2024-10-07T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-035",
//     projectName: "Cloud Migration Project (35)",
//     status: "dropped",
//     projectDescription:
//       "Migrating all company data and services to a new cloud infrastructure.",
//     totalMembers: 8,
//     progress: 31,
//     startDate: "2025-01-03T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m2",
//       name: "Bob Williams",
//       email: "bob.w@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=b",
//     },
//     teamMembers: [
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//     ],
//     budget: {
//       allocated: 146833,
//       spent: 128786,
//     },
//     lastUpdated: "2025-07-31T10:54:01.332312",
//     createdOn: "2025-01-03T10:54:01.332312",
//     createdBy: {
//       id: "c1",
//       name: "Admin User",
//       email: "admin@example.com",
//     },
//   },
//   {
//     id: "proj-036",
//     projectName: "Marketing Campaign Automation (36)",
//     status: "planning",
//     projectDescription:
//       "Automating our email and social media marketing campaigns.",
//     totalMembers: 8,
//     progress: 90,
//     startDate: "2025-05-17T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m2",
//       name: "Bob Williams",
//       email: "bob.w@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=b",
//     },
//     teamMembers: [
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//     ],
//     budget: {
//       allocated: 436285,
//       spent: 346528,
//     },
//     lastUpdated: "2025-08-03T10:54:01.332312",
//     createdOn: "2025-05-17T10:54:01.332312",
//     createdBy: {
//       id: "c1",
//       name: "Admin User",
//       email: "admin@example.com",
//     },
//   },
//   {
//     id: "proj-037",
//     projectName: "E-commerce Platform Relaunch (37)",
//     status: "ongoing",
//     projectDescription:
//       "Upgrading our internal content management system for better scalability and security.",
//     totalMembers: 4,
//     progress: 39,
//     startDate: "2024-11-09T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m4",
//       name: "Diana Prince",
//       email: "diana.p@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=d",
//     },
//     teamMembers: [
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//     ],
//     budget: {
//       allocated: 66914,
//       spent: 80415,
//     },
//     lastUpdated: "2025-07-24T10:54:01.332312",
//     createdOn: "2024-11-09T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-038",
//     projectName: "Customer Feedback Portal (38)",
//     status: "ongoing",
//     projectDescription:
//       "Optimizing the global supply chain to reduce costs and improve efficiency.",
//     totalMembers: 4,
//     progress: 69,
//     startDate: "2024-12-25T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m4",
//       name: "Diana Prince",
//       email: "diana.p@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=d",
//     },
//     teamMembers: [
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//     ],
//     budget: {
//       allocated: 464880,
//       spent: 331115,
//     },
//     lastUpdated: "2025-08-01T10:54:01.332312",
//     createdOn: "2024-12-25T10:54:01.332312",
//     createdBy: {
//       id: "c1",
//       name: "Admin User",
//       email: "admin@example.com",
//     },
//   },
//   {
//     id: "proj-039",
//     projectName: "Mobile App Development (39)",
//     status: "dropped",
//     projectDescription:
//       "Developing a new mobile application for both iOS and Android platforms.",
//     totalMembers: 15,
//     progress: 69,
//     startDate: "2024-08-20T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m1",
//       name: "Alice Johnson",
//       email: "alice.j@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=a",
//     },
//     teamMembers: [
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//     ],
//     budget: {
//       allocated: 369463,
//       spent: 88798,
//     },
//     lastUpdated: "2025-08-02T10:54:01.332312",
//     createdOn: "2024-08-20T10:54:01.332312",
//     createdBy: {
//       id: "c1",
//       name: "Admin User",
//       email: "admin@example.com",
//     },
//   },
//   {
//     id: "proj-040",
//     projectName: "Internal CMS Upgrade (40)",
//     status: "ongoing",
//     projectDescription:
//       "Developing a new mobile application for both iOS and Android platforms.",
//     totalMembers: 8,
//     progress: 24,
//     startDate: "2024-08-29T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m3",
//       name: "Charlie Brown",
//       email: "charlie.b@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=c",
//     },
//     teamMembers: [
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//     ],
//     budget: {
//       allocated: 380763,
//       spent: 267466,
//     },
//     lastUpdated: "2025-07-22T10:54:01.332312",
//     createdOn: "2024-08-29T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-041",
//     projectName: "E-commerce Platform Relaunch (41)",
//     status: "ongoing",
//     projectDescription:
//       "Creating a new portal for customers to submit and track feedback.",
//     totalMembers: 4,
//     progress: 31,
//     startDate: "2024-10-31T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m4",
//       name: "Diana Prince",
//       email: "diana.p@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=d",
//     },
//     teamMembers: [
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//     ],
//     budget: {
//       allocated: 316193,
//       spent: 88215,
//     },
//     lastUpdated: "2025-08-12T10:54:01.332312",
//     createdOn: "2024-10-31T10:54:01.332312",
//     createdBy: {
//       id: "c1",
//       name: "Admin User",
//       email: "admin@example.com",
//     },
//   },
//   {
//     id: "proj-042",
//     projectName: "Cloud Migration Project (42)",
//     status: "on-hold",
//     projectDescription:
//       "Building a real-time data visualization dashboard for key business metrics.",
//     totalMembers: 15,
//     progress: 59,
//     startDate: "2024-11-24T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m1",
//       name: "Alice Johnson",
//       email: "alice.j@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=a",
//     },
//     teamMembers: [
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//     ],
//     budget: {
//       allocated: 445892,
//       spent: 20304,
//     },
//     lastUpdated: "2025-08-01T10:54:01.332312",
//     createdOn: "2024-11-24T10:54:01.332312",
//     createdBy: {
//       id: "c1",
//       name: "Admin User",
//       email: "admin@example.com",
//     },
//   },
//   {
//     id: "proj-043",
//     projectName: "E-commerce Platform Relaunch (43)",
//     status: "completed",
//     projectDescription:
//       "A complete overhaul of our existing e-commerce site to improve user experience and performance.",
//     totalMembers: 6,
//     progress: 37,
//     startDate: "2025-04-23T10:54:01.332312",
//     endDate: "2025-08-13T10:54:01.332312",
//     manager: {
//       id: "m3",
//       name: "Charlie Brown",
//       email: "charlie.b@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=c",
//     },
//     teamMembers: [
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//     ],
//     budget: {
//       allocated: 142487,
//       spent: 316485,
//     },
//     lastUpdated: "2025-08-05T10:54:01.332312",
//     createdOn: "2025-04-23T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-044",
//     projectName: "Internal CMS Upgrade (44)",
//     status: "ongoing",
//     projectDescription:
//       "Building a real-time data visualization dashboard for key business metrics.",
//     totalMembers: 8,
//     progress: 97,
//     startDate: "2024-11-20T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m1",
//       name: "Alice Johnson",
//       email: "alice.j@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=a",
//     },
//     teamMembers: [
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//     ],
//     budget: {
//       allocated: 410769,
//       spent: 144199,
//     },
//     lastUpdated: "2025-08-10T10:54:01.332312",
//     createdOn: "2024-11-20T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-045",
//     projectName: "Supply Chain Optimization (45)",
//     status: "planning",
//     projectDescription:
//       "Automating our email and social media marketing campaigns.",
//     totalMembers: 13,
//     progress: 20,
//     startDate: "2024-11-02T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m3",
//       name: "Charlie Brown",
//       email: "charlie.b@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=c",
//     },
//     teamMembers: [
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//     ],
//     budget: {
//       allocated: 470476,
//       spent: 379586,
//     },
//     lastUpdated: "2025-07-25T10:54:01.332312",
//     createdOn: "2024-11-02T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-046",
//     projectName: "Corporate Website Redesign (46)",
//     status: "ongoing",
//     projectDescription:
//       "A complete overhaul of our existing e-commerce site to improve user experience and performance.",
//     totalMembers: 11,
//     progress: 12,
//     startDate: "2025-05-21T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m3",
//       name: "Charlie Brown",
//       email: "charlie.b@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=c",
//     },
//     teamMembers: [
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//     ],
//     budget: {
//       allocated: 153945,
//       spent: 445528,
//     },
//     lastUpdated: "2025-08-08T10:54:01.332312",
//     createdOn: "2025-05-21T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-047",
//     projectName: "Internal CMS Upgrade (47)",
//     status: "planning",
//     projectDescription:
//       "A complete redesign of the company's corporate website to reflect a new brand identity.",
//     totalMembers: 15,
//     progress: 83,
//     startDate: "2024-11-26T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m3",
//       name: "Charlie Brown",
//       email: "charlie.b@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=c",
//     },
//     teamMembers: [
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//     ],
//     budget: {
//       allocated: 498912,
//       spent: 77594,
//     },
//     lastUpdated: "2025-08-10T10:54:01.332312",
//     createdOn: "2024-11-26T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-048",
//     projectName: "E-commerce Platform Relaunch (48)",
//     status: "dropped",
//     projectDescription:
//       "Optimizing the global supply chain to reduce costs and improve efficiency.",
//     totalMembers: 10,
//     progress: 99,
//     startDate: "2024-08-26T10:54:01.332312",
//     endDate: "2024-09-13T10:54:01.332312",
//     manager: {
//       id: "m4",
//       name: "Diana Prince",
//       email: "diana.p@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=d",
//     },
//     teamMembers: [
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//     ],
//     budget: {
//       allocated: 257413,
//       spent: 312555,
//     },
//     lastUpdated: "2025-07-18T10:54:01.332312",
//     createdOn: "2024-08-26T10:54:01.332312",
//     createdBy: {
//       id: "c2",
//       name: "Jane Doe",
//       email: "jane.d@example.com",
//     },
//   },
//   {
//     id: "proj-049",
//     projectName: "E-commerce Platform Relaunch (49)",
//     status: "dropped",
//     projectDescription:
//       "Migrating all company data and services to a new cloud infrastructure.",
//     totalMembers: 5,
//     progress: 28,
//     startDate: "2024-12-12T10:54:01.332312",
//     endDate: "2025-03-08T10:54:01.332312",
//     manager: {
//       id: "m4",
//       name: "Diana Prince",
//       email: "diana.p@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=d",
//     },
//     teamMembers: [
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//     ],
//     budget: {
//       allocated: 467086,
//       spent: 338485,
//     },
//     lastUpdated: "2025-08-02T10:54:01.332312",
//     createdOn: "2024-12-12T10:54:01.332312",
//     createdBy: {
//       id: "c1",
//       name: "Admin User",
//       email: "admin@example.com",
//     },
//   },
//   {
//     id: "proj-050",
//     projectName: "Data Analytics Dashboard (50)",
//     status: "ongoing",
//     projectDescription:
//       "A complete redesign of the company's corporate website to reflect a new brand identity.",
//     totalMembers: 11,
//     progress: 62,
//     startDate: "2025-03-11T10:54:01.332312",
//     endDate: null,
//     manager: {
//       id: "m3",
//       name: "Charlie Brown",
//       email: "charlie.b@example.com",
//       imgSrc: "https://i.pravatar.cc/150?u=c",
//     },
//     teamMembers: [
//       {
//         name: "Grace Wilson",
//         imgSrc: "https://i.pravatar.cc/150?u=g",
//       },
//       {
//         name: "Ella Davis",
//         imgSrc: "https://i.pravatar.cc/150?u=e",
//       },
//       {
//         name: "Jack Evans",
//         imgSrc: "https://i.pravatar.cc/150?u=j",
//       },
//       {
//         name: "Ivy Moore",
//         imgSrc: "https://i.pravatar.cc/150?u=i",
//       },
//       {
//         name: "Harry Taylor",
//         imgSrc: "https://i.pravatar.cc/150?u=h",
//       },
//       {
//         name: "Leo Harris",
//         imgSrc: "https://i.pravatar.cc/150?u=l",
//       },
//       {
//         name: "Kim Lee",
//         imgSrc: "https://i.pravatar.cc/150?u=k",
//       },
//       {
//         name: "Frank Miller",
//         imgSrc: "https://i.pravatar.cc/150?u=f",
//       },
//     ],
//     budget: {
//       allocated: 252155,
//       spent: 181244,
//     },
//     lastUpdated: "2025-07-28T10:54:01.332312",
//     createdOn: "2025-03-11T10:54:01.332312",
//     createdBy: {
//       id: "c1",
//       name: "Admin User",
//       email: "admin@example.com",
//     },
//   },
// ];


// Dummy JSON-like data for current projects

export type ProjectStatus = "On Track" | "At Risk" | "Blocked";

export interface Project {
  id?: string | number;
  name: string;
  owner: string;            // display name or email
  team?: string;            // optional (e.g., "Design", "Platform")
  tags?: string[];          // optional labels
  progress: number;         // 0..100
  status: ProjectStatus;
  dueDate: string;          // ISO date string
}

export const projectData: Project[] = [
  {
    id: "PJT-1001",
    name: "Marketing Website Revamp",
    owner: "Aisha Khan",
    team: "Design",
    tags: ["web", "brand"],
    progress: 72,
    status: "On Track",
    dueDate: "2025-09-05",
  },
  {
    id: "PJT-1002",
    name: "Payments v2",
    owner: "Ravi Patel",
    team: "Platform",
    tags: ["billing", "api"],
    progress: 41,
    status: "At Risk",
    dueDate: "2025-08-28",
  },
  {
    id: "PJT-1003",
    name: "Mobile App Onboarding",
    owner: "Meera Singh",
    team: "Product",
    tags: ["growth", "mobile"],
    progress: 93,
    status: "On Track",
    dueDate: "2025-09-30",
  },
  {
    id: "PJT-1004",
    name: "Data Warehouse Migration",
    owner: "Chen Wei",
    team: "Data",
    tags: ["etl", "infra"],
    progress: 18,
    status: "Blocked",
    dueDate: "2025-10-15",
  },
  {
    id: "PJT-1005",
    name: "Customer Portal",
    owner: "Olivia Martins",
    team: "Frontend",
    tags: ["react", "portal"],
    progress: 57,
    status: "At Risk",
    dueDate: "2025-09-12",
  },
  {
    id: "PJT-1006",
    name: "Alerting & Monitoring",
    owner: "Diego Lopez",
    team: "SRE",
    tags: ["observability"],
    progress: 64,
    status: "On Track",
    dueDate: "2025-09-22",
  },
  {
    id: "PJT-1007",
    name: "AI Assist POC",
    owner: "Zara Ahmed",
    team: "Research",
    tags: ["ml", "poc"],
    progress: 33,
    status: "On Track",
    dueDate: "2025-10-02",
  },
  {
    id: "PJT-1008",
    name: "Compliance Audits",
    owner: "Liam O’Connor",
    team: "Security",
    tags: ["iso27001"],
    progress: 25,
    status: "Blocked",
    dueDate: "2025-08-29",
  },
  {
    id: "PJT-1009",
    name: "Checkout UX Polish",
    owner: "Noah Brown",
    team: "Growth",
    tags: ["a/b-test", "ux"],
    progress: 80,
    status: "On Track",
    dueDate: "2025-09-08",
  },
  {
    id: "PJT-1010",
    name: "Partner API",
    owner: "Priya Nair",
    team: "Platform",
    tags: ["api", "partners"],
    progress: 46,
    status: "At Risk",
    dueDate: "2025-09-25",
  },
];



