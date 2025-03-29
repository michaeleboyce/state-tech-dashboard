export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  jurisdiction: string;
  agency: string;
  url?: string;
  tags: string[];
  virtual?: boolean;
}

// Data extracted from the provided research
export const events: Event[] = [
  {
    id: '1',
    title: 'NASCIO Midyear Conference',
    description: 'The National Association of State CIOs (NASCIO) holds its midyear conference focusing on state government IT management, policy, and governance.',
    date: '2025-05-03',
    location: 'Baltimore, MD',
    jurisdiction: 'State',
    agency: 'National Association of State CIOs',
    url: 'https://www.nascio.org/events/',
    tags: ['IT Leadership', 'Policy', 'Governance']
  },
  {
    id: '2',
    title: 'California Digital ID Implementation Planning',
    description: 'California Department of Technology planning session for the implementation of their new Digital ID system, which will enable secure authentication for government services.',
    date: '2025-04-22',
    location: 'Sacramento, CA',
    jurisdiction: 'State',
    agency: 'California Department of Technology',
    url: 'https://cdt.ca.gov/digital-id/',
    tags: ['Digital Identity', 'Authentication', 'Security']
  },
  {
    id: '3',
    title: 'Boston Smart City Initiative Launch',
    description: 'Launch of Boston\'s comprehensive smart city program focusing on connected infrastructure, including IoT sensors for traffic management and environmental monitoring.',
    date: '2025-05-02',
    location: 'Boston, MA',
    jurisdiction: 'Local',
    agency: 'Boston Department of Innovation and Technology',
    url: 'https://www.boston.gov/innovation',
    tags: ['Smart Cities', 'IoT', 'Urban Technology']
  },
  {
    id: '4',
    title: 'Texas Ransomware Defense Framework Workshop',
    description: 'The Texas Department of Information Resources hosts a workshop on its updated ransomware defense framework, following incidents affecting several municipalities.',
    date: '2025-05-10',
    location: 'Austin, TX',
    jurisdiction: 'State',
    agency: 'Texas Department of Information Resources',
    url: 'https://dir.texas.gov/cybersecurity',
    tags: ['Cybersecurity', 'Ransomware', 'Incident Response']
  },
  {
    id: '5',
    title: 'Illinois Digital Government Summit',
    description: 'Annual summit bringing together Illinois state and local government technology leaders to discuss digital service delivery and citizen-centered design.',
    date: '2025-05-15',
    location: 'Springfield, IL',
    jurisdiction: 'State',
    agency: 'Illinois Department of Innovation & Technology',
    url: 'https://www2.illinois.gov/doit',
    tags: ['Digital Government', 'Innovation', 'User Experience']
  },
  {
    id: '6',
    title: 'Miami-Dade County AI Ethics Symposium',
    description: 'Symposium on ethical AI use in government, addressing issues like algorithmic bias, transparency, and accountability in automated decision systems.',
    date: '2025-05-20',
    location: 'Miami, FL',
    jurisdiction: 'Local',
    agency: 'Miami-Dade County Information Technology Department',
    url: 'https://www.miamidade.gov/technology',
    tags: ['Artificial Intelligence', 'Ethics', 'Algorithmic Governance']
  },
  {
    id: '7',
    title: 'Washington State Cloud-First Strategy Implementation',
    description: 'Work session for Washington state agencies on the state\'s new cloud-first strategy, addressing legacy modernization challenges and cloud-native approaches.',
    date: '2025-06-05',
    location: 'Olympia, WA',
    jurisdiction: 'State',
    agency: 'Washington Technology Solutions (WaTech)',
    url: 'https://watech.wa.gov/cloud',
    tags: ['Cloud Computing', 'Legacy Modernization', 'Digital Transformation']
  },
  {
    id: '8',
    title: 'NYC Privacy-Enhancing Technologies Forum',
    description: 'Forum on privacy-enhancing technologies and data minimization approaches for city agencies, with a focus on compliance with local privacy laws.',
    date: '2025-06-12',
    location: 'New York, NY',
    jurisdiction: 'Local',
    agency: 'NYC Department of Information Technology & Telecommunications',
    url: 'https://www.nyc.gov/doitt',
    tags: ['Data Privacy', 'PETs', 'Compliance']
  },
  {
    id: '9',
    title: 'Georgia Inclusive Digital Services Design Workshop',
    description: 'Workshop on creating accessible and inclusive digital services for all citizens, focusing on ADA compliance and multilingual support.',
    date: '2025-06-20',
    location: 'Atlanta, GA',
    jurisdiction: 'State',
    agency: 'Georgia Technology Authority',
    url: 'https://gta.georgia.gov/digital',
    tags: ['Accessibility', 'Digital Inclusion', 'User Experience']
  },
  {
    id: '10',
    title: 'Colorado Legacy Systems Modernization Town Hall',
    description: 'Public town hall on Colorado\'s initiative to modernize critical legacy systems, including unemployment insurance and motor vehicle registration platforms.',
    date: '2025-07-08',
    location: 'Denver, CO',
    jurisdiction: 'State',
    agency: 'Colorado Governor\'s Office of Information Technology',
    url: 'https://oit.colorado.gov/modernization',
    tags: ['IT Modernization', 'Legacy Systems', 'Digital Services']
  },
  {
    id: '11',
    title: 'State Cybersecurity Infrastructure Conference',
    description: 'Conference focusing on securing critical state infrastructure from cyber threats, featuring presentations from CISA and state security leaders.',
    date: '2025-06-15',
    location: 'Virtual Event',
    jurisdiction: 'State',
    agency: 'Multi-State Information Sharing and Analysis Center (MS-ISAC)',
    url: 'https://www.cisecurity.org/ms-isac',
    tags: ['Cybersecurity', 'Critical Infrastructure', 'Threat Intelligence'],
    virtual: true
  },
  {
    id: '12',
    title: 'Michigan Citizen Experience Improvement Initiative Kickoff',
    description: 'Launch event for Michigan\'s initiative to redesign digital citizen experiences across all state services using human-centered design principles.',
    date: '2025-05-25',
    location: 'Lansing, MI',
    jurisdiction: 'State',
    agency: 'Michigan Department of Technology, Management and Budget',
    url: 'https://www.michigan.gov/dtmb',
    tags: ['User Experience', 'Digital Services', 'Service Design']
  },
  {
    id: '13',
    title: 'Philadelphia Smart City Data Integration Workshop',
    description: 'Technical workshop on integrating data from multiple city systems to create a unified smart city data platform for improved decision-making.',
    date: '2025-07-15',
    location: 'Philadelphia, PA',
    jurisdiction: 'Local',
    agency: 'Philadelphia Office of Innovation and Technology',
    url: 'https://www.phila.gov/departments/office-of-innovation-and-technology/',
    tags: ['Data Integration', 'Smart Cities', 'Data Analytics']
  },
  {
    id: '14',
    title: 'Arizona Whole-of-State Cybersecurity Summit',
    description: 'Statewide summit bringing together state agencies, counties, municipalities, and tribal governments to coordinate on cybersecurity strategies.',
    date: '2025-08-05',
    location: 'Phoenix, AZ',
    jurisdiction: 'State',
    agency: 'Arizona Department of Administration',
    url: 'https://aset.az.gov/security',
    tags: ['Cybersecurity', 'Intergovernmental Coordination', 'Risk Management']
  },
  {
    id: '15',
    title: 'Minnesota Digital Equity Framework Planning Session',
    description: 'Planning session for Minnesota\'s digital equity framework, addressing broadband access and digital skills to ensure all residents can access online services.',
    date: '2025-06-28',
    location: 'St. Paul, MN',
    jurisdiction: 'State',
    agency: 'Minnesota IT Services',
    url: 'https://mn.gov/mnit/',
    tags: ['Digital Equity', 'Broadband', 'Digital Inclusion']
  }
];
