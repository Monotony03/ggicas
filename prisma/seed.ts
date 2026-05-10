import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/* ─── Countries ──────────────────────────────────────────────────────────── */
const countriesData = [
  { name: 'United States',  isoCode: 'USA', region: 'North America',  gdpCurrentUsd: 27360000000000, militaryBudget: 886000000000 },
  { name: 'Soviet Union',   isoCode: 'SUN', region: 'Eurasia',        gdpCurrentUsd: 2500000000000,  militaryBudget: 310000000000 },
  { name: 'Russia',         isoCode: 'RUS', region: 'Eurasia',        gdpCurrentUsd: 2240000000000,  militaryBudget: 109000000000 },
  { name: 'United Kingdom', isoCode: 'GBR', region: 'Europe',         gdpCurrentUsd: 3079000000000,  militaryBudget: 81000000000 },
  { name: 'China',          isoCode: 'CHN', region: 'Asia',           gdpCurrentUsd: 17790000000000, militaryBudget: 296000000000 },
  { name: 'France',         isoCode: 'FRA', region: 'Europe',         gdpCurrentUsd: 2923000000000,  militaryBudget: 61000000000 },
  { name: 'Germany',        isoCode: 'DEU', region: 'Europe',         gdpCurrentUsd: 4456000000000,  militaryBudget: 66000000000 },
  { name: 'Japan',          isoCode: 'JPN', region: 'Asia',           gdpCurrentUsd: 4213000000000,  militaryBudget: 46000000000 },
  { name: 'India',          isoCode: 'IND', region: 'Asia',           gdpCurrentUsd: 3730000000000,  militaryBudget: 83000000000 },
  { name: 'Canada',         isoCode: 'CAN', region: 'North America',  gdpCurrentUsd: 2140000000000,  militaryBudget: 27000000000 },
  { name: 'Australia',      isoCode: 'AUS', region: 'Oceania',        gdpCurrentUsd: 1707000000000,  militaryBudget: 32000000000 },
  { name: 'North Korea',    isoCode: 'PRK', region: 'Asia',           gdpCurrentUsd: 18000000000,    militaryBudget: 4000000000 },
  { name: 'South Korea',    isoCode: 'KOR', region: 'Asia',           gdpCurrentUsd: 1709000000000,  militaryBudget: 46000000000 },
  { name: 'Vietnam',        isoCode: 'VNM', region: 'Asia',           gdpCurrentUsd: 430000000000,   militaryBudget: 8000000000 },
  { name: 'Afghanistan',    isoCode: 'AFG', region: 'Asia',           gdpCurrentUsd: 14000000000,    militaryBudget: 400000000 },
  { name: 'Cuba',           isoCode: 'CUB', region: 'Americas',       gdpCurrentUsd: 107000000000,   militaryBudget: 2000000000 },
  { name: 'Iran',           isoCode: 'IRN', region: 'Middle East',    gdpCurrentUsd: 366000000000,   militaryBudget: 10000000000 },
  { name: 'Iraq',           isoCode: 'IRQ', region: 'Middle East',    gdpCurrentUsd: 248000000000,   militaryBudget: 7000000000 },
  { name: 'Saudi Arabia',   isoCode: 'SAU', region: 'Middle East',    gdpCurrentUsd: 1108000000000,  militaryBudget: 75000000000 },
  { name: 'Israel',         isoCode: 'ISR', region: 'Middle East',    gdpCurrentUsd: 521000000000,   militaryBudget: 23000000000 },
  { name: 'Egypt',          isoCode: 'EGY', region: 'Africa',         gdpCurrentUsd: 396000000000,   militaryBudget: 5000000000 },
  { name: 'Turkey',         isoCode: 'TUR', region: 'Eurasia',        gdpCurrentUsd: 1154000000000,  militaryBudget: 20000000000 },
  { name: 'Brazil',         isoCode: 'BRA', region: 'South America',  gdpCurrentUsd: 2173000000000,  militaryBudget: 20000000000 },
  { name: 'Mexico',         isoCode: 'MEX', region: 'North America',  gdpCurrentUsd: 1322000000000,  militaryBudget: 8000000000 },
  { name: 'South Africa',   isoCode: 'ZAF', region: 'Africa',         gdpCurrentUsd: 399000000000,   militaryBudget: 3000000000 },
  { name: 'Italy',          isoCode: 'ITA', region: 'Europe',         gdpCurrentUsd: 2170000000000,  militaryBudget: 33000000000 },
  { name: 'Spain',          isoCode: 'ESP', region: 'Europe',         gdpCurrentUsd: 1582000000000,  militaryBudget: 20000000000 },
  { name: 'Ukraine',        isoCode: 'UKR', region: 'Europe',         gdpCurrentUsd: 179000000000,   militaryBudget: 62000000000 },
  { name: 'Pakistan',       isoCode: 'PAK', region: 'Asia',           gdpCurrentUsd: 341000000000,   militaryBudget: 10000000000 },
  { name: 'Poland',         isoCode: 'POL', region: 'Europe',         gdpCurrentUsd: 842000000000,   militaryBudget: 32000000000 },
]

/* ─── Leaders ────────────────────────────────────────────────────────────── */
const leadersData = [
  // USA
  { iso: 'USA', name: 'Franklin D. Roosevelt',  title: 'President',      start: '1933-03-04', end: '1945-04-12' },
  { iso: 'USA', name: 'Harry S. Truman',         title: 'President',      start: '1945-04-12', end: '1953-01-20' },
  { iso: 'USA', name: 'Dwight D. Eisenhower',    title: 'President',      start: '1953-01-20', end: '1961-01-20' },
  { iso: 'USA', name: 'John F. Kennedy',          title: 'President',      start: '1961-01-20', end: '1963-11-22' },
  { iso: 'USA', name: 'Lyndon B. Johnson',        title: 'President',      start: '1963-11-22', end: '1969-01-20' },
  { iso: 'USA', name: 'Richard Nixon',            title: 'President',      start: '1969-01-20', end: '1974-08-09' },
  { iso: 'USA', name: 'Gerald Ford',              title: 'President',      start: '1974-08-09', end: '1977-01-20' },
  { iso: 'USA', name: 'Jimmy Carter',             title: 'President',      start: '1977-01-20', end: '1981-01-20' },
  { iso: 'USA', name: 'Ronald Reagan',            title: 'President',      start: '1981-01-20', end: '1989-01-20' },
  { iso: 'USA', name: 'George H.W. Bush',         title: 'President',      start: '1989-01-20', end: '1993-01-20' },
  { iso: 'USA', name: 'Bill Clinton',             title: 'President',      start: '1993-01-20', end: '2001-01-20' },
  { iso: 'USA', name: 'George W. Bush',           title: 'President',      start: '2001-01-20', end: '2009-01-20' },
  { iso: 'USA', name: 'Barack Obama',             title: 'President',      start: '2009-01-20', end: '2017-01-20' },
  { iso: 'USA', name: 'Donald Trump',             title: 'President',      start: '2017-01-20', end: '2021-01-20' },
  { iso: 'USA', name: 'Joe Biden',                title: 'President',      start: '2021-01-20', end: '2025-01-20' },
  { iso: 'USA', name: 'Donald Trump',             title: 'President',      start: '2025-01-20', end: null },
  // USSR
  { iso: 'SUN', name: 'Joseph Stalin',            title: 'Premier',        start: '1924-01-21', end: '1953-03-05' },
  { iso: 'SUN', name: 'Nikita Khrushchev',        title: 'Premier',        start: '1953-09-07', end: '1964-10-14' },
  { iso: 'SUN', name: 'Leonid Brezhnev',          title: 'Premier',        start: '1964-10-14', end: '1982-11-10' },
  { iso: 'SUN', name: 'Yuri Andropov',            title: 'Premier',        start: '1982-11-12', end: '1984-02-09' },
  { iso: 'SUN', name: 'Konstantin Chernenko',     title: 'Premier',        start: '1984-02-13', end: '1985-03-10' },
  { iso: 'SUN', name: 'Mikhail Gorbachev',        title: 'President',      start: '1985-03-11', end: '1991-12-25' },
  // Russia
  { iso: 'RUS', name: 'Boris Yeltsin',            title: 'President',      start: '1991-07-10', end: '1999-12-31' },
  { iso: 'RUS', name: 'Vladimir Putin',           title: 'President',      start: '1999-12-31', end: null },
  // UK
  { iso: 'GBR', name: 'Winston Churchill',        title: 'Prime Minister', start: '1940-05-10', end: '1945-07-26' },
  { iso: 'GBR', name: 'Clement Attlee',           title: 'Prime Minister', start: '1945-07-26', end: '1951-10-26' },
  { iso: 'GBR', name: 'Winston Churchill',        title: 'Prime Minister', start: '1951-10-26', end: '1955-04-05' },
  { iso: 'GBR', name: 'Sir Anthony Eden',         title: 'Prime Minister', start: '1955-04-06', end: '1957-01-09' },
  { iso: 'GBR', name: 'Harold Macmillan',         title: 'Prime Minister', start: '1957-01-10', end: '1963-10-18' },
  { iso: 'GBR', name: 'Harold Wilson',            title: 'Prime Minister', start: '1964-10-16', end: '1970-06-19' },
  { iso: 'GBR', name: 'Edward Heath',             title: 'Prime Minister', start: '1970-06-19', end: '1974-03-04' },
  { iso: 'GBR', name: 'Harold Wilson',            title: 'Prime Minister', start: '1974-03-04', end: '1976-04-05' },
  { iso: 'GBR', name: 'James Callaghan',          title: 'Prime Minister', start: '1976-04-05', end: '1979-05-04' },
  { iso: 'GBR', name: 'Margaret Thatcher',        title: 'Prime Minister', start: '1979-05-04', end: '1990-11-28' },
  { iso: 'GBR', name: 'John Major',               title: 'Prime Minister', start: '1990-11-28', end: '1997-05-02' },
  { iso: 'GBR', name: 'Tony Blair',               title: 'Prime Minister', start: '1997-05-02', end: '2007-06-27' },
  { iso: 'GBR', name: 'Gordon Brown',             title: 'Prime Minister', start: '2007-06-27', end: '2010-05-11' },
  { iso: 'GBR', name: 'David Cameron',            title: 'Prime Minister', start: '2010-05-11', end: '2016-07-13' },
  { iso: 'GBR', name: 'Theresa May',              title: 'Prime Minister', start: '2016-07-13', end: '2019-07-24' },
  { iso: 'GBR', name: 'Boris Johnson',            title: 'Prime Minister', start: '2019-07-24', end: '2022-09-06' },
  { iso: 'GBR', name: 'Rishi Sunak',              title: 'Prime Minister', start: '2022-10-25', end: '2024-07-05' },
  { iso: 'GBR', name: 'Keir Starmer',             title: 'Prime Minister', start: '2024-07-05', end: null },
  // China
  { iso: 'CHN', name: 'Mao Zedong',              title: 'Chairman',          start: '1949-10-01', end: '1976-09-09' },
  { iso: 'CHN', name: 'Hua Guofeng',             title: 'Chairman',          start: '1976-10-07', end: '1981-06-27' },
  { iso: 'CHN', name: 'Deng Xiaoping',           title: 'Paramount Leader',  start: '1978-12-18', end: '1989-11-09' },
  { iso: 'CHN', name: 'Jiang Zemin',             title: 'President',         start: '1993-03-27', end: '2003-03-15' },
  { iso: 'CHN', name: 'Hu Jintao',               title: 'President',         start: '2003-03-15', end: '2013-03-14' },
  { iso: 'CHN', name: 'Xi Jinping',              title: 'President',         start: '2013-03-14', end: null },
  // France
  { iso: 'FRA', name: 'Charles de Gaulle',       title: 'President',         start: '1959-01-08', end: '1969-04-28' },
  { iso: 'FRA', name: 'Georges Pompidou',        title: 'President',         start: '1969-06-20', end: '1974-04-02' },
  { iso: 'FRA', name: 'Valéry Giscard d\'Estaing', title: 'President',      start: '1974-05-27', end: '1981-05-21' },
  { iso: 'FRA', name: 'François Mitterrand',     title: 'President',         start: '1981-05-21', end: '1995-05-17' },
  { iso: 'FRA', name: 'Jacques Chirac',          title: 'President',         start: '1995-05-17', end: '2007-05-16' },
  { iso: 'FRA', name: 'Nicolas Sarkozy',         title: 'President',         start: '2007-05-16', end: '2012-05-15' },
  { iso: 'FRA', name: 'François Hollande',       title: 'President',         start: '2012-05-15', end: '2017-05-14' },
  { iso: 'FRA', name: 'Emmanuel Macron',         title: 'President',         start: '2017-05-14', end: null },
  // Germany
  { iso: 'DEU', name: 'Konrad Adenauer',         title: 'Chancellor',        start: '1949-09-15', end: '1963-10-16' },
  { iso: 'DEU', name: 'Ludwig Erhard',           title: 'Chancellor',        start: '1963-10-16', end: '1966-12-01' },
  { iso: 'DEU', name: 'Willy Brandt',            title: 'Chancellor',        start: '1969-10-21', end: '1974-05-07' },
  { iso: 'DEU', name: 'Helmut Schmidt',          title: 'Chancellor',        start: '1974-05-16', end: '1982-10-01' },
  { iso: 'DEU', name: 'Helmut Kohl',             title: 'Chancellor',        start: '1982-10-01', end: '1998-10-27' },
  { iso: 'DEU', name: 'Gerhard Schröder',        title: 'Chancellor',        start: '1998-10-27', end: '2005-11-22' },
  { iso: 'DEU', name: 'Angela Merkel',           title: 'Chancellor',        start: '2005-11-22', end: '2021-12-08' },
  { iso: 'DEU', name: 'Olaf Scholz',             title: 'Chancellor',        start: '2021-12-08', end: null },
  // Japan
  { iso: 'JPN', name: 'Shigeru Yoshida',         title: 'Prime Minister',    start: '1946-05-22', end: '1954-12-10' },
  { iso: 'JPN', name: 'Nobusuke Kishi',          title: 'Prime Minister',    start: '1957-02-25', end: '1960-07-15' },
  { iso: 'JPN', name: 'Eisaku Satō',             title: 'Prime Minister',    start: '1964-11-09', end: '1972-07-07' },
  { iso: 'JPN', name: 'Yasuhiro Nakasone',       title: 'Prime Minister',    start: '1982-11-27', end: '1987-11-06' },
  { iso: 'JPN', name: 'Junichiro Koizumi',       title: 'Prime Minister',    start: '2001-04-26', end: '2006-09-26' },
  { iso: 'JPN', name: 'Shinzo Abe',              title: 'Prime Minister',    start: '2012-12-26', end: '2020-09-16' },
  { iso: 'JPN', name: 'Fumio Kishida',           title: 'Prime Minister',    start: '2021-10-04', end: '2024-10-01' },
  { iso: 'JPN', name: 'Shigeru Ishiba',          title: 'Prime Minister',    start: '2024-10-01', end: null },
  // India
  { iso: 'IND', name: 'Jawaharlal Nehru',        title: 'Prime Minister',    start: '1947-08-15', end: '1964-05-27' },
  { iso: 'IND', name: 'Lal Bahadur Shastri',    title: 'Prime Minister',    start: '1964-06-09', end: '1966-01-11' },
  { iso: 'IND', name: 'Indira Gandhi',           title: 'Prime Minister',    start: '1966-01-19', end: '1977-03-24' },
  { iso: 'IND', name: 'Morarji Desai',           title: 'Prime Minister',    start: '1977-03-24', end: '1979-07-28' },
  { iso: 'IND', name: 'Indira Gandhi',           title: 'Prime Minister',    start: '1980-01-14', end: '1984-10-31' },
  { iso: 'IND', name: 'Rajiv Gandhi',            title: 'Prime Minister',    start: '1984-10-31', end: '1989-12-02' },
  { iso: 'IND', name: 'P.V. Narasimha Rao',     title: 'Prime Minister',    start: '1991-06-21', end: '1996-05-16' },
  { iso: 'IND', name: 'Atal Bihari Vajpayee',   title: 'Prime Minister',    start: '1999-10-13', end: '2004-05-22' },
  { iso: 'IND', name: 'Manmohan Singh',          title: 'Prime Minister',    start: '2004-05-22', end: '2014-05-26' },
  { iso: 'IND', name: 'Narendra Modi',           title: 'Prime Minister',    start: '2014-05-26', end: null },
  // Saudi Arabia
  { iso: 'SAU', name: 'King Abdulaziz',          title: 'King',              start: '1932-09-23', end: '1953-11-09' },
  { iso: 'SAU', name: 'King Saud',               title: 'King',              start: '1953-11-09', end: '1964-11-02' },
  { iso: 'SAU', name: 'King Faisal',             title: 'King',              start: '1964-11-02', end: '1975-03-25' },
  { iso: 'SAU', name: 'King Khalid',             title: 'King',              start: '1975-03-25', end: '1982-06-13' },
  { iso: 'SAU', name: 'King Fahd',               title: 'King',              start: '1982-06-13', end: '2005-08-01' },
  { iso: 'SAU', name: 'King Abdullah',           title: 'King',              start: '2005-08-01', end: '2015-01-23' },
  { iso: 'SAU', name: 'King Salman',             title: 'King',              start: '2015-01-23', end: null },
  // Iran
  { iso: 'IRN', name: 'Mohammad Mosaddegh',      title: 'Prime Minister',    start: '1951-04-28', end: '1953-08-19' },
  { iso: 'IRN', name: 'Mohammad Reza Shah',      title: 'Shah',              start: '1941-09-16', end: '1979-02-11' },
  { iso: 'IRN', name: 'Ruhollah Khomeini',       title: 'Supreme Leader',    start: '1979-02-11', end: '1989-06-03' },
  { iso: 'IRN', name: 'Ali Khamenei',            title: 'Supreme Leader',    start: '1989-06-04', end: null },
  // Israel
  { iso: 'ISR', name: 'David Ben-Gurion',        title: 'Prime Minister',    start: '1948-05-14', end: '1963-06-16' },
  { iso: 'ISR', name: 'Golda Meir',             title: 'Prime Minister',    start: '1969-03-17', end: '1974-06-03' },
  { iso: 'ISR', name: 'Menachem Begin',          title: 'Prime Minister',    start: '1977-06-20', end: '1983-10-10' },
  { iso: 'ISR', name: 'Yitzhak Rabin',           title: 'Prime Minister',    start: '1992-07-13', end: '1995-11-04' },
  { iso: 'ISR', name: 'Benjamin Netanyahu',      title: 'Prime Minister',    start: '1996-06-18', end: '1999-07-06' },
  { iso: 'ISR', name: 'Benjamin Netanyahu',      title: 'Prime Minister',    start: '2009-03-31', end: '2021-06-13' },
  { iso: 'ISR', name: 'Naftali Bennett',         title: 'Prime Minister',    start: '2021-06-13', end: '2022-07-01' },
  { iso: 'ISR', name: 'Benjamin Netanyahu',      title: 'Prime Minister',    start: '2022-12-29', end: null },
  // North Korea
  { iso: 'PRK', name: 'Kim Il-sung',             title: 'Supreme Leader',    start: '1948-09-09', end: '1994-07-08' },
  { iso: 'PRK', name: 'Kim Jong-il',             title: 'Supreme Leader',    start: '1994-07-08', end: '2011-12-17' },
  { iso: 'PRK', name: 'Kim Jong-un',             title: 'Supreme Leader',    start: '2011-12-28', end: null },
  // South Korea
  { iso: 'KOR', name: 'Syngman Rhee',            title: 'President',         start: '1948-08-15', end: '1960-04-27' },
  { iso: 'KOR', name: 'Park Chung-hee',          title: 'President',         start: '1963-12-17', end: '1979-10-26' },
  { iso: 'KOR', name: 'Roh Tae-woo',             title: 'President',         start: '1988-02-25', end: '1993-02-25' },
  { iso: 'KOR', name: 'Kim Dae-jung',            title: 'President',         start: '1998-02-25', end: '2003-02-25' },
  { iso: 'KOR', name: 'Lee Myung-bak',           title: 'President',         start: '2008-02-25', end: '2013-02-25' },
  { iso: 'KOR', name: 'Park Geun-hye',           title: 'President',         start: '2013-02-25', end: '2017-03-10' },
  { iso: 'KOR', name: 'Moon Jae-in',             title: 'President',         start: '2017-05-10', end: '2022-05-10' },
  { iso: 'KOR', name: 'Yoon Suk-yeol',           title: 'President',         start: '2022-05-10', end: null },
  // Turkey
  { iso: 'TUR', name: 'Mustafa Kemal Atatürk',  title: 'President',         start: '1923-10-29', end: '1938-11-10' },
  { iso: 'TUR', name: 'İsmet İnönü',             title: 'President',         start: '1938-11-11', end: '1950-05-22' },
  { iso: 'TUR', name: 'Celal Bayar',             title: 'President',         start: '1950-05-22', end: '1960-05-27' },
  { iso: 'TUR', name: 'Turgut Özal',             title: 'President',         start: '1989-11-09', end: '1993-04-17' },
  { iso: 'TUR', name: 'Recep Tayyip Erdoğan',   title: 'President',         start: '2014-08-28', end: null },
  // Brazil
  { iso: 'BRA', name: 'Getúlio Vargas',          title: 'President',         start: '1930-10-03', end: '1945-10-29' },
  { iso: 'BRA', name: 'Juscelino Kubitschek',    title: 'President',         start: '1956-01-31', end: '1961-01-31' },
  { iso: 'BRA', name: 'Lula da Silva',           title: 'President',         start: '2003-01-01', end: '2011-01-01' },
  { iso: 'BRA', name: 'Dilma Rousseff',          title: 'President',         start: '2011-01-01', end: '2016-08-31' },
  { iso: 'BRA', name: 'Jair Bolsonaro',          title: 'President',         start: '2019-01-01', end: '2023-01-01' },
  { iso: 'BRA', name: 'Lula da Silva',           title: 'President',         start: '2023-01-01', end: null },
  // Pakistan
  { iso: 'PAK', name: 'Muhammad Ali Jinnah',     title: 'Governor-General',  start: '1947-08-14', end: '1948-09-11' },
  { iso: 'PAK', name: 'Ayub Khan',               title: 'President',         start: '1958-10-27', end: '1969-03-25' },
  { iso: 'PAK', name: 'Zulfikar Ali Bhutto',     title: 'Prime Minister',    start: '1973-08-14', end: '1977-07-05' },
  { iso: 'PAK', name: 'Pervez Musharraf',        title: 'President',         start: '2001-06-20', end: '2008-08-18' },
  { iso: 'PAK', name: 'Imran Khan',              title: 'Prime Minister',    start: '2018-08-18', end: '2022-04-10' },
  { iso: 'PAK', name: 'Shehbaz Sharif',          title: 'Prime Minister',    start: '2022-04-11', end: null },
  // Ukraine
  { iso: 'UKR', name: 'Leonid Kravchuk',         title: 'President',         start: '1991-12-05', end: '1994-07-19' },
  { iso: 'UKR', name: 'Leonid Kuchma',           title: 'President',         start: '1994-07-19', end: '2005-01-23' },
  { iso: 'UKR', name: 'Viktor Yushchenko',       title: 'President',         start: '2005-01-23', end: '2010-02-25' },
  { iso: 'UKR', name: 'Viktor Yanukovych',       title: 'President',         start: '2010-02-25', end: '2014-02-22' },
  { iso: 'UKR', name: 'Petro Poroshenko',        title: 'President',         start: '2014-06-07', end: '2019-05-20' },
  { iso: 'UKR', name: 'Volodymyr Zelensky',      title: 'President',         start: '2019-05-20', end: null },
  // Egypt
  { iso: 'EGY', name: 'Gamal Abdel Nasser',      title: 'President',         start: '1954-11-14', end: '1970-09-28' },
  { iso: 'EGY', name: 'Anwar Sadat',             title: 'President',         start: '1970-10-15', end: '1981-10-06' },
  { iso: 'EGY', name: 'Hosni Mubarak',           title: 'President',         start: '1981-10-14', end: '2011-02-11' },
  { iso: 'EGY', name: 'Abdel Fattah el-Sisi',    title: 'President',         start: '2014-06-08', end: null },
  // Canada
  { iso: 'CAN', name: 'Lester B. Pearson',       title: 'Prime Minister',    start: '1963-04-22', end: '1968-04-20' },
  { iso: 'CAN', name: 'Pierre Trudeau',          title: 'Prime Minister',    start: '1968-04-20', end: '1984-06-30' },
  { iso: 'CAN', name: 'Brian Mulroney',          title: 'Prime Minister',    start: '1984-09-17', end: '1993-06-25' },
  { iso: 'CAN', name: 'Jean Chrétien',           title: 'Prime Minister',    start: '1993-11-04', end: '2003-12-12' },
  { iso: 'CAN', name: 'Stephen Harper',          title: 'Prime Minister',    start: '2006-02-06', end: '2015-11-04' },
  { iso: 'CAN', name: 'Justin Trudeau',          title: 'Prime Minister',    start: '2015-11-04', end: '2025-03-14' },
  { iso: 'CAN', name: 'Mark Carney',             title: 'Prime Minister',    start: '2025-03-14', end: null },
  // Australia
  { iso: 'AUS', name: 'Robert Menzies',          title: 'Prime Minister',    start: '1949-12-19', end: '1966-01-26' },
  { iso: 'AUS', name: 'John Howard',             title: 'Prime Minister',    start: '1996-03-11', end: '2007-12-03' },
  { iso: 'AUS', name: 'Kevin Rudd',              title: 'Prime Minister',    start: '2007-12-03', end: '2010-06-24' },
  { iso: 'AUS', name: 'Tony Abbott',             title: 'Prime Minister',    start: '2013-09-18', end: '2015-09-15' },
  { iso: 'AUS', name: 'Scott Morrison',          title: 'Prime Minister',    start: '2018-08-24', end: '2022-05-23' },
  { iso: 'AUS', name: 'Anthony Albanese',        title: 'Prime Minister',    start: '2022-05-23', end: null },
  // Poland
  { iso: 'POL', name: 'Wojciech Jaruzelski',     title: 'President',         start: '1989-07-19', end: '1990-12-22' },
  { iso: 'POL', name: 'Lech Wałęsa',            title: 'President',         start: '1990-12-22', end: '1995-12-22' },
  { iso: 'POL', name: 'Aleksander Kwaśniewski',  title: 'President',         start: '1995-12-23', end: '2005-12-23' },
  { iso: 'POL', name: 'Lech Kaczyński',          title: 'President',         start: '2005-12-23', end: '2010-04-10' },
  { iso: 'POL', name: 'Bronisław Komorowski',    title: 'President',         start: '2010-08-06', end: '2015-08-06' },
  { iso: 'POL', name: 'Andrzej Duda',            title: 'President',         start: '2015-08-06', end: null },
]

/* ─── Alliances ──────────────────────────────────────────────────────────── */
const alliancesData = [
  // NATO bloc
  { a: 'USA', b: 'GBR', type: 'Defense Pact',     motivation: 'Founding NATO members — mutual collective defense against Soviet expansion in Europe.',                                              start: '1949-04-04', end: null },
  { a: 'USA', b: 'FRA', type: 'Defense Pact',     motivation: 'NATO founding alliance; France later withdrew from unified command but remained a member.',                                        start: '1949-04-04', end: null },
  { a: 'USA', b: 'CAN', type: 'Defense Pact',     motivation: 'NATO and NORAD co-founders for joint North American continental air defense.',                                                     start: '1949-04-04', end: null },
  { a: 'USA', b: 'DEU', type: 'Defense Pact',     motivation: 'West Germany joined NATO in 1955; key frontline state in Cold War European theater.',                                              start: '1955-05-09', end: null },
  { a: 'USA', b: 'ITA', type: 'Defense Pact',     motivation: 'NATO founding member; Italy provided key Mediterranean and southern-flank basing.',                                                start: '1949-04-04', end: null },
  { a: 'USA', b: 'TUR', type: 'Defense Pact',     motivation: 'Turkey joined NATO in 1952; crucial southern flank and Bosphorus straits control.',                                               start: '1952-02-18', end: null },
  { a: 'USA', b: 'AUS', type: 'Defense Pact',     motivation: 'ANZUS Treaty — mutual Pacific defense pact between USA, Australia, and New Zealand.',                                              start: '1951-09-01', end: null },
  { a: 'USA', b: 'JPN', type: 'Defense Pact',     motivation: 'US–Japan Security Treaty; USA guarantees Japan\'s defense; Japan hosts major US military bases.',                                start: '1960-01-19', end: null },
  { a: 'USA', b: 'KOR', type: 'Defense Pact',     motivation: 'Mutual Defense Treaty post-Korean War; 28,000 US troops stationed in South Korea.',                                               start: '1953-10-01', end: null },
  { a: 'USA', b: 'ISR', type: 'Strategic Alliance', motivation: 'Long-standing security cooperation, military aid ($3.8B/yr), and shared geopolitical objectives in the Middle East.',           start: '1948-05-14', end: null },
  { a: 'USA', b: 'SAU', type: 'Strategic Alliance', motivation: 'Oil-for-security pact: USA guarantees Saudi security; Saudi Arabia prices oil in USD and caps OPEC production.',                start: '1945-02-14', end: null },
  { a: 'USA', b: 'POL', type: 'Defense Pact',     motivation: 'Poland joined NATO in 1999; front-line NATO state after Russia-Ukraine war hosts US troops and Patriot batteries.',               start: '1999-03-12', end: null },
  // Warsaw Pact / Soviet blocs
  { a: 'SUN', b: 'UKR', type: 'Defense Pact',     motivation: 'Warsaw Pact member; Ukraine was a key Soviet republic with major nuclear and industrial infrastructure.',                          start: '1955-05-14', end: '1991-07-01' },
  { a: 'SUN', b: 'CUB', type: 'Strategic Alliance', motivation: 'Soviet aid and missile deployment in Cuba as a direct counter-threat to American territory.',                                   start: '1960-05-08', end: '1991-12-25' },
  { a: 'SUN', b: 'VNM', type: 'Strategic Alliance', motivation: 'Soviet arms, advisors, and financial support for North Vietnam against US-backed South Vietnam.',                              start: '1954-07-21', end: '1975-04-30' },
  { a: 'SUN', b: 'AFG', type: 'Strategic Alliance', motivation: 'Soviet-backed communist government in Kabul; led directly to Soviet invasion in 1979.',                                        start: '1978-04-27', end: '1989-02-15' },
  { a: 'CHN', b: 'SUN', type: 'Strategic Alliance', motivation: 'Sino-Soviet Pact of Friendship; Chinese ideological and economic alignment with Soviet Union.',                                 start: '1950-02-14', end: '1961-07-01' },
  { a: 'CHN', b: 'PRK', type: 'Strategic Alliance', motivation: 'Mutual defence treaty; China intervened in Korean War with over 1 million troops to save North Korea.',                        start: '1950-10-19', end: null },
  { a: 'RUS', b: 'IRN', type: 'Strategic Alliance', motivation: 'Strategic partnership: Russia supplies advanced weapons and nuclear technology; Iran provides Shahed drones.',                   start: '2015-09-30', end: null },
  { a: 'RUS', b: 'PRK', type: 'Strategic Alliance', motivation: 'Military cooperation pact: North Korea supplies artillery shells; Russia reciprocates with food and data.',                      start: '2023-09-13', end: null },
  // India
  { a: 'IND', b: 'RUS', type: 'Strategic Alliance', motivation: 'Legacy Soviet arms supply relationship; India largest buyer of Russian weapons; special and privileged strategic partnership.', start: '1971-08-09', end: null },
  { a: 'IND', b: 'USA', type: 'Strategic Alliance', motivation: 'US–India defense framework (DTTI, BECA); shared democratic values and Indo-Pacific balancing of China.',                       start: '2005-07-18', end: null },
  // Middle East
  { a: 'SAU', b: 'USA', type: 'Strategic Alliance', motivation: 'Part of the original "oil-for-security" deal; US forces based in Saudi Arabia.',                                                start: '1945-02-14', end: null },
  { a: 'IRN', b: 'IRQ', type: 'Strategic Alliance', motivation: 'Iran-backed Iraqi Shia militias and proxy forces; tacit political alignment against US presence.',                               start: '2003-04-09', end: null },
  // UK bilateral
  { a: 'GBR', b: 'AUS', type: 'Defense Pact',     motivation: 'AUKUS pact (alongside USA): nuclear-powered submarine technology transfer; Indo-Pacific power projection.',                       start: '2021-09-15', end: null },
]

/* ─── Conflicts ──────────────────────────────────────────────────────────── */
const conflictsData = [
  {
    name: 'World War II',
    type: 'World War',
    cause: 'Nazi Germany\'s aggressive expansionism under Hitler, Japanese imperialism in Asia-Pacific, and Italy\'s Fascist ambitions triggered a global conflict involving over 30 nations and resulting in ~85 million deaths.',
    start: '1939-09-01', end: '1945-09-02',
    participants: [
      { iso: 'USA', role: 'Allied Power' }, { iso: 'GBR', role: 'Allied Power' },
      { iso: 'SUN', role: 'Allied Power (from 1941)' }, { iso: 'FRA', role: 'Allied Power' },
      { iso: 'DEU', role: 'Axis Power' }, { iso: 'ITA', role: 'Axis Power' },
      { iso: 'JPN', role: 'Axis Power' }, { iso: 'CHN', role: 'Allied Power' },
      { iso: 'CAN', role: 'Allied Power' }, { iso: 'AUS', role: 'Allied Power' },
      { iso: 'POL', role: 'Allied Power' },
    ]
  },
  {
    name: 'Cold War',
    type: 'Global Proxy War',
    cause: 'Ideological struggle for global dominance between Capitalist Western Bloc (USA-led) and Communist Eastern Bloc (USSR-led). Driven by post-WWII power vacuums, nuclear arms race, and mutually incompatible political systems.',
    start: '1947-03-12', end: '1991-12-26',
    participants: [
      { iso: 'USA', role: 'Western Bloc Leader' }, { iso: 'SUN', role: 'Eastern Bloc Leader' },
      { iso: 'GBR', role: 'Western Bloc Major Ally' }, { iso: 'FRA', role: 'Western Bloc Major Ally' },
      { iso: 'CHN', role: 'Eastern Bloc Ally (1949–1961)' }, { iso: 'DEU', role: 'Western Bloc (West Germany)' },
      { iso: 'CUB', role: 'Eastern Bloc Outpost' }, { iso: 'VNM', role: 'Eastern Bloc Proxy' },
    ]
  },
  {
    name: 'Korean War',
    type: 'Invasion',
    cause: 'North Korea (backed by China and USSR) invaded South Korea attempting to unify the peninsula under communist rule; USA and UN intervened; ended in armistice not peace treaty — technically ongoing.',
    start: '1950-06-25', end: '1953-07-27',
    participants: [
      { iso: 'PRK', role: 'Aggressor' }, { iso: 'KOR', role: 'Defender' },
      { iso: 'USA', role: 'UN Coalition Leader' }, { iso: 'CHN', role: 'Intervening Power (North Korea Ally)' },
      { iso: 'SUN', role: 'Funder/Supplier (North Korea)' }, { iso: 'GBR', role: 'UN Coalition' },
      { iso: 'AUS', role: 'UN Coalition' }, { iso: 'CAN', role: 'UN Coalition' },
    ]
  },
  {
    name: 'Vietnam War',
    type: 'Proxy War',
    cause: 'North Vietnam (backed by USSR and China) sought to reunify Vietnam under communism; USA backed South Vietnam under the Domino Theory to contain communism in Southeast Asia.',
    start: '1955-11-01', end: '1975-04-30',
    participants: [
      { iso: 'VNM', role: 'Primary Belligerent (North)' }, { iso: 'USA', role: 'Intervening Power (South Vietnam)' },
      { iso: 'SUN', role: 'Supplier/Funder (North Vietnam)' }, { iso: 'CHN', role: 'Ally (North Vietnam)' },
      { iso: 'AUS', role: 'Coalition Partner (South Vietnam)' }, { iso: 'KOR', role: 'Coalition Partner (South Vietnam)' },
    ]
  },
  {
    name: 'Soviet-Afghan War',
    type: 'Invasion',
    cause: 'USSR invaded Afghanistan to prop up the communist PDPA government against Mujahideen rebels. USA, Pakistan, Saudi Arabia, and China covertly funded the resistance (Operation Cyclone), turning it into a Cold War proxy conflict.',
    start: '1979-12-24', end: '1989-02-15',
    participants: [
      { iso: 'SUN', role: 'Invading Power' }, { iso: 'AFG', role: 'Battlefield' },
      { iso: 'USA', role: 'Covert Funder (Mujahideen)' }, { iso: 'PAK', role: 'Proxy Facilitator' },
      { iso: 'SAU', role: 'Funder (Mujahideen)' }, { iso: 'CHN', role: 'Arms Supplier (Mujahideen)' },
    ]
  },
  {
    name: 'Gulf War',
    type: 'Invasion',
    cause: 'Iraq under Saddam Hussein invaded and annexed Kuwait over oil pricing disputes and debt from Iran-Iraq War. A US-led UN coalition of 35 nations expelled Iraqi forces in Operation Desert Storm.',
    start: '1990-08-02', end: '1991-02-28',
    participants: [
      { iso: 'IRQ', role: 'Aggressor' }, { iso: 'USA', role: 'Coalition Leader' },
      { iso: 'GBR', role: 'Coalition Member' }, { iso: 'SAU', role: 'Coalition Host' },
      { iso: 'FRA', role: 'Coalition Member' }, { iso: 'EGY', role: 'Coalition Member' },
    ]
  },
  {
    name: 'Iraq War',
    type: 'Invasion',
    cause: 'USA and UK invaded Iraq alleging it possessed WMDs and had links to Al-Qaeda post-9/11. No WMDs were found. Led to collapse of Saddam Hussein\'s government, prolonged insurgency, and rise of ISIS.',
    start: '2003-03-20', end: '2011-12-15',
    participants: [
      { iso: 'USA', role: 'Primary Invader' }, { iso: 'GBR', role: 'Primary Invader' },
      { iso: 'IRQ', role: 'Defender/Battlefield' }, { iso: 'AUS', role: 'Coalition Member' },
      { iso: 'POL', role: 'Coalition Member' }, { iso: 'IRN', role: 'Regional Destabilizer' },
    ]
  },
  {
    name: 'War on Terror / Afghanistan',
    type: 'Insurgency',
    cause: 'Following 9/11 attacks by Al-Qaeda, USA invaded Afghanistan to dismantle the Taliban regime that harboured Osama bin Laden. Turned into the longest US war (2001–2021); Taliban retook power weeks after US withdrawal.',
    start: '2001-10-07', end: '2021-08-30',
    participants: [
      { iso: 'USA', role: 'Primary Belligerent' }, { iso: 'AFG', role: 'Battlefield' },
      { iso: 'GBR', role: 'Major Ally' }, { iso: 'CAN', role: 'NATO Coalition' },
      { iso: 'AUS', role: 'NATO Coalition' }, { iso: 'POL', role: 'NATO Coalition' },
      { iso: 'PAK', role: 'Ambiguous Facilitator' },
    ]
  },
  {
    name: 'Russia–Ukraine War',
    type: 'Invasion',
    cause: 'Russia launched a full-scale invasion of Ukraine on 24 Feb 2022 citing NATO expansion, Ukrainian sovereignty in Donbas, and historical claims. Ukraine backed by Western military aid; largest European land war since WWII.',
    start: '2022-02-24', end: null,
    participants: [
      { iso: 'RUS', role: 'Aggressor' }, { iso: 'UKR', role: 'Defender' },
      { iso: 'USA', role: 'Arms/Aid Supplier (Ukraine)' }, { iso: 'GBR', role: 'Arms/Aid Supplier (Ukraine)' },
      { iso: 'DEU', role: 'Arms/Aid Supplier (Ukraine)' }, { iso: 'POL', role: 'Frontline NATO Supporter' },
      { iso: 'FRA', role: 'Arms/Aid Supplier (Ukraine)' }, { iso: 'PRK', role: 'Artillery Supplier (Russia)' },
      { iso: 'IRN', role: 'Drone Supplier (Russia)' },
    ]
  },
  {
    name: 'Israel–Hamas War',
    type: 'Invasion',
    cause: 'Hamas launched the largest terror attack on Israel since 1948 on Oct 7 2023, killing 1,200 people and taking 250 hostages. Israel\'s retaliatory military campaign in Gaza has caused massive civilian casualties and a global humanitarian crisis.',
    start: '2023-10-07', end: null,
    participants: [
      { iso: 'ISR', role: 'Primary Belligerent' }, { iso: 'USA', role: 'Arms/Diplomatic Support (Israel)' },
      { iso: 'GBR', role: 'Limited Support (Israel)' }, { iso: 'IRN', role: 'Hamas Funder/Armer' },
      { iso: 'EGY', role: 'Ceasefire Mediator' }, { iso: 'SAU', role: 'Concerned Observer' },
    ]
  },
  {
    name: 'India–Pakistan Conflicts',
    type: 'Border Dispute',
    cause: 'Ongoing territorial dispute over Kashmir since 1947 partition. Four full wars fought (1947, 1965, 1971, 1999 Kargil). Both nuclear-armed states; persistent cross-border terrorism and militant infiltration.',
    start: '1947-10-22', end: null,
    participants: [
      { iso: 'IND', role: 'Primary Belligerent' }, { iso: 'PAK', role: 'Primary Belligerent' },
      { iso: 'CHN', role: 'Pakistan Strategic Backer' }, { iso: 'USA', role: 'Historical Pakistan Supporter' },
    ]
  },
  {
    name: 'Yom Kippur War',
    type: 'Invasion',
    cause: 'Egypt and Syria launched a surprise attack on Israel on the Jewish holy day of Yom Kippur to recapture Sinai and Golan Heights lost in 1967. US airlifted arms to Israel; USSR airlifted to Egypt; led to 1973 oil crisis.',
    start: '1973-10-06', end: '1973-10-25',
    participants: [
      { iso: 'EGY', role: 'Aggressor (Sinai front)' }, { iso: 'ISR', role: 'Defender' },
      { iso: 'USA', role: 'Arms Supplier (Israel)' }, { iso: 'SUN', role: 'Arms Supplier (Egypt/Syria)' },
      { iso: 'SAU', role: 'Oil Embargo (anti-Israel)' },
    ]
  },
]

/* ─── Sanctions ──────────────────────────────────────────────────────────── */
const sanctionsData = [
  { imposer: 'USA', target: 'CUB', type: 'Economic',      start: '1962-02-07', end: null },
  { imposer: 'USA', target: 'IRN', type: 'Economic',      start: '1979-11-14', end: null },
  { imposer: 'USA', target: 'PRK', type: 'Economic',      start: '1950-06-28', end: null },
  { imposer: 'USA', target: 'RUS', type: 'Economic',      start: '2014-03-17', end: null },
  { imposer: 'USA', target: 'IRQ', type: 'Economic',      start: '1990-08-06', end: '2003-05-22' },
  { imposer: 'USA', target: 'SUN', type: 'Arms Embargo',  start: '1980-01-04', end: '1991-12-25' },
  { imposer: 'GBR', target: 'RUS', type: 'Economic',      start: '2022-02-24', end: null },
  { imposer: 'GBR', target: 'IRN', type: 'Arms Embargo',  start: '2006-12-23', end: null },
  { imposer: 'FRA', target: 'RUS', type: 'Economic',      start: '2022-02-24', end: null },
  { imposer: 'DEU', target: 'RUS', type: 'Economic',      start: '2022-02-24', end: null },
  { imposer: 'JPN', target: 'RUS', type: 'Economic',      start: '2022-03-01', end: null },
  { imposer: 'JPN', target: 'PRK', type: 'Economic',      start: '2006-10-14', end: null },
  { imposer: 'AUS', target: 'RUS', type: 'Economic',      start: '2022-02-25', end: null },
  { imposer: 'CAN', target: 'RUS', type: 'Economic',      start: '2022-02-24', end: null },
  { imposer: 'USA', target: 'ZAF', type: 'Economic',      start: '1986-10-02', end: '1991-07-10' },
  { imposer: 'POL', target: 'RUS', type: 'Economic',      start: '2022-02-24', end: null },
  { imposer: 'ISR', target: 'IRN', type: 'Arms Embargo',  start: '1979-02-11', end: null },
  { imposer: 'SAU', target: 'IRN', type: 'Diplomatic',    start: '2016-01-03', end: '2023-03-10' },
]

/* ─── Trade Relations ────────────────────────────────────────────────────── */
const tradeData = [
  // USA trade
  { a: 'USA', b: 'CHN', year: 2023, volume: 575000000000 },
  { a: 'USA', b: 'CAN', year: 2023, volume: 783000000000 },
  { a: 'USA', b: 'MEX', year: 2023, volume: 798000000000 },
  { a: 'USA', b: 'DEU', year: 2023, volume: 254000000000 },
  { a: 'USA', b: 'JPN', year: 2023, volume: 230000000000 },
  { a: 'USA', b: 'GBR', year: 2023, volume: 150000000000 },
  { a: 'USA', b: 'KOR', year: 2023, volume: 170000000000 },
  { a: 'USA', b: 'IND', year: 2023, volume: 128000000000 },
  // China trade
  { a: 'CHN', b: 'JPN', year: 2023, volume: 318000000000 },
  { a: 'CHN', b: 'KOR', year: 2023, volume: 310000000000 },
  { a: 'CHN', b: 'AUS', year: 2023, volume: 215000000000 },
  { a: 'CHN', b: 'DEU', year: 2023, volume: 254000000000 },
  { a: 'CHN', b: 'RUS', year: 2023, volume: 240000000000 },
  { a: 'CHN', b: 'BRA', year: 2023, volume: 157000000000 },
  // Europe
  { a: 'DEU', b: 'FRA', year: 2023, volume: 170000000000 },
  { a: 'DEU', b: 'GBR', year: 2023, volume: 142000000000 },
  { a: 'DEU', b: 'ITA', year: 2023, volume: 160000000000 },
  // Middle East
  { a: 'SAU', b: 'CHN', year: 2023, volume: 106000000000 },
  { a: 'SAU', b: 'IND', year: 2023, volume: 52000000000 },
  { a: 'SAU', b: 'JPN', year: 2023, volume: 42000000000 },
  // Historical
  { a: 'USA', b: 'CHN', year: 2000, volume: 116000000000 },
  { a: 'USA', b: 'CHN', year: 2010, volume: 457000000000 },
  { a: 'USA', b: 'JPN', year: 2000, volume: 210000000000 },
  { a: 'USA', b: 'DEU', year: 2000, volume: 88000000000 },
  { a: 'CHN', b: 'RUS', year: 2010, volume: 59000000000 },
  { a: 'IND', b: 'USA', year: 2010, volume: 48000000000 },
]

/* ─── Arms Transfers ─────────────────────────────────────────────────────── */
// Format: { exp: exporter ISO, imp: importer ISO, type: weapon type, year, tiv (Trend Indicator Value in millions) }
const armsTransfersData = [
  // ── Cold War era ────────────────────────────────────────────────────────
  { exp: 'USA', imp: 'GBR',  type: 'Aircraft',            year: 1944, tiv: 1200 },
  { exp: 'USA', imp: 'FRA',  type: 'Aircraft',            year: 1944, tiv:  900 },
  { exp: 'SUN', imp: 'CHN',  type: 'Aircraft',            year: 1950, tiv:  780 },
  { exp: 'SUN', imp: 'CHN',  type: 'Armored Vehicles',   year: 1951, tiv:  430 },
  { exp: 'USA', imp: 'KOR',  type: 'Aircraft',            year: 1953, tiv:  620 },
  { exp: 'USA', imp: 'KOR',  type: 'Armored Vehicles',   year: 1954, tiv:  340 },
  { exp: 'SUN', imp: 'EGY',  type: 'Aircraft',            year: 1955, tiv:  490 },
  { exp: 'SUN', imp: 'EGY',  type: 'Armored Vehicles',   year: 1956, tiv:  330 },
  { exp: 'USA', imp: 'ISR',  type: 'Aircraft',            year: 1966, tiv:  880 },
  { exp: 'USA', imp: 'ISR',  type: 'Missiles',            year: 1967, tiv:  540 },
  { exp: 'SUN', imp: 'VNM',  type: 'Air Defense Systems', year: 1965, tiv:  410 },
  { exp: 'SUN', imp: 'VNM',  type: 'Aircraft',            year: 1966, tiv:  370 },
  { exp: 'USA', imp: 'VNM',  type: 'Aircraft',            year: 1968, tiv:  760 },
  { exp: 'CHN', imp: 'VNM',  type: 'Artillery',           year: 1967, tiv:  220 },
  { exp: 'USA', imp: 'SAU',  type: 'Aircraft',            year: 1971, tiv:  690 },
  { exp: 'SUN', imp: 'IRQ',  type: 'Aircraft',            year: 1973, tiv:  580 },
  { exp: 'SUN', imp: 'EGY',  type: 'Missiles',            year: 1973, tiv:  460 },
  { exp: 'USA', imp: 'ISR',  type: 'Armored Vehicles',   year: 1973, tiv:  820 },
  { exp: 'SUN', imp: 'AFG',  type: 'Aircraft',            year: 1979, tiv:  370 },
  { exp: 'SUN', imp: 'AFG',  type: 'Armored Vehicles',   year: 1980, tiv:  490 },
  { exp: 'USA', imp: 'PAK',  type: 'Aircraft',            year: 1981, tiv:  550 },
  { exp: 'CHN', imp: 'PAK',  type: 'Aircraft',            year: 1982, tiv:  340 },
  { exp: 'CHN', imp: 'PAK',  type: 'Missiles',            year: 1985, tiv:  280 },
  { exp: 'SUN', imp: 'IND',  type: 'Aircraft',            year: 1980, tiv:  760 },
  { exp: 'SUN', imp: 'IND',  type: 'Naval Weapons',       year: 1982, tiv:  510 },
  // ── Post Cold War ────────────────────────────────────────────────────────
  { exp: 'USA', imp: 'SAU',  type: 'Aircraft',            year: 1991, tiv: 1450 },
  { exp: 'USA', imp: 'SAU',  type: 'Air Defense Systems', year: 1992, tiv:  890 },
  { exp: 'USA', imp: 'ISR',  type: 'Aircraft',            year: 1994, tiv:  980 },
  { exp: 'GBR', imp: 'SAU',  type: 'Aircraft',            year: 1995, tiv:  870 },
  { exp: 'RUS', imp: 'IND',  type: 'Aircraft',            year: 1996, tiv: 1200 },
  { exp: 'RUS', imp: 'CHN',  type: 'Aircraft',            year: 1996, tiv: 1100 },
  { exp: 'RUS', imp: 'CHN',  type: 'Naval Weapons',       year: 1997, tiv:  760 },
  { exp: 'FRA', imp: 'SAU',  type: 'Aircraft',            year: 1998, tiv:  640 },
  { exp: 'USA', imp: 'KOR',  type: 'Aircraft',            year: 1999, tiv:  780 },
  { exp: 'USA', imp: 'JPN',  type: 'Air Defense Systems', year: 1999, tiv:  620 },
  // ── 2000s ────────────────────────────────────────────────────────────────
  { exp: 'RUS', imp: 'IND',  type: 'Naval Weapons',       year: 2004, tiv: 1500 },
  { exp: 'USA', imp: 'ISR',  type: 'Air Defense Systems', year: 2005, tiv:  840 },
  { exp: 'USA', imp: 'SAU',  type: 'Armored Vehicles',   year: 2006, tiv:  920 },
  { exp: 'CHN', imp: 'PAK',  type: 'Naval Weapons',       year: 2006, tiv:  680 },
  { exp: 'RUS', imp: 'IND',  type: 'Aircraft',            year: 2007, tiv: 1800 },
  { exp: 'USA', imp: 'AUS',  type: 'Aircraft',            year: 2007, tiv:  950 },
  { exp: 'GBR', imp: 'SAU',  type: 'Aircraft',            year: 2008, tiv: 1100 },
  { exp: 'RUS', imp: 'VNM',  type: 'Naval Weapons',       year: 2009, tiv:  730 },
  // ── 2010s ────────────────────────────────────────────────────────────────
  { exp: 'USA', imp: 'SAU',  type: 'Aircraft',            year: 2010, tiv: 2100 },
  { exp: 'USA', imp: 'ISR',  type: 'Missiles',            year: 2011, tiv: 1250 },
  { exp: 'RUS', imp: 'IND',  type: 'Air Defense Systems', year: 2012, tiv: 1600 },
  { exp: 'USA', imp: 'KOR',  type: 'Air Defense Systems', year: 2013, tiv:  780 },
  { exp: 'FRA', imp: 'IND',  type: 'Aircraft',            year: 2016, tiv: 3200 },
  { exp: 'RUS', imp: 'TUR',  type: 'Air Defense Systems', year: 2017, tiv: 2500 },
  { exp: 'USA', imp: 'SAU',  type: 'Missiles',            year: 2017, tiv: 1800 },
  { exp: 'RUS', imp: 'IRN',  type: 'Air Defense Systems', year: 2017, tiv: 1200 },
  { exp: 'CHN', imp: 'PAK',  type: 'Aircraft',            year: 2018, tiv: 1400 },
  { exp: 'USA', imp: 'POL',  type: 'Air Defense Systems', year: 2018, tiv:  960 },
  { exp: 'USA', imp: 'AUS',  type: 'Armored Vehicles',   year: 2019, tiv: 1100 },
  { exp: 'RUS', imp: 'IND',  type: 'Aircraft',            year: 2019, tiv: 2100 },
  // ── 2020s ────────────────────────────────────────────────────────────────
  { exp: 'USA', imp: 'UKR',  type: 'Air Defense Systems', year: 2022, tiv: 3800 },
  { exp: 'USA', imp: 'UKR',  type: 'Armored Vehicles',   year: 2022, tiv: 2200 },
  { exp: 'GBR', imp: 'UKR',  type: 'Missiles',            year: 2022, tiv: 1450 },
  { exp: 'DEU', imp: 'UKR',  type: 'Armored Vehicles',   year: 2023, tiv: 2800 },
  { exp: 'USA', imp: 'ISR',  type: 'Aircraft',            year: 2023, tiv: 3400 },
  { exp: 'USA', imp: 'ISR',  type: 'Missiles',            year: 2023, tiv: 2600 },
  { exp: 'PRK', imp: 'RUS',  type: 'Artillery',           year: 2023, tiv: 1200 },
  { exp: 'IRN', imp: 'RUS',  type: 'Missiles',            year: 2023, tiv:  980 },
  { exp: 'USA', imp: 'POL',  type: 'Armored Vehicles',   year: 2024, tiv: 1600 },
  { exp: 'USA', imp: 'KOR',  type: 'Missiles',            year: 2024, tiv:  840 },
  { exp: 'GBR', imp: 'SAU',  type: 'Aircraft',            year: 2024, tiv: 1900 },
  { exp: 'FRA', imp: 'IND',  type: 'Naval Weapons',       year: 2024, tiv: 2400 },
]

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════════════════ */
async function main() {
  console.log('🗑️  Clearing database...')
  await prisma.armsTransfer.deleteMany()
  await prisma.tradeRelation.deleteMany()
  await prisma.sanction.deleteMany()
  await prisma.conflictInvolvement.deleteMany()
  await prisma.alliance.deleteMany()
  await prisma.conflict.deleteMany()
  await prisma.organization.deleteMany()
  await prisma.leader.deleteMany()
  await prisma.country.deleteMany()

  // ── Countries
  console.log('🌍 Creating countries...')
  for (const c of countriesData) {
    await prisma.country.create({ data: c })
  }
  const countries = await prisma.country.findMany()
  const cMap = new Map(countries.map(c => [c.isoCode, c.id]))

  // ── Leaders
  console.log('👤 Creating leaders...')
  for (const l of leadersData) {
    const countryId = cMap.get(l.iso)
    if (!countryId) { console.warn(`  Skip leader for unknown iso: ${l.iso}`); continue }
    await prisma.leader.create({
      data: {
        name: l.name, title: l.title, countryId,
        startDate: new Date(l.start),
        endDate: l.end ? new Date(l.end) : null,
      }
    })
  }

  // ── Organizations
  console.log('🏛️  Creating organizations...')
  const nato       = await prisma.organization.create({ data: { name: 'NATO',         type: 'Military'  } })
  const warsawPact = await prisma.organization.create({ data: { name: 'Warsaw Pact',  type: 'Military'  } })
  const aukus      = await prisma.organization.create({ data: { name: 'AUKUS',        type: 'Military'  } })
  const sco        = await prisma.organization.create({ data: { name: 'SCO',          type: 'Political' } })

  // Org membership map — purely for reference; alliances carry the real data
  void nato; void warsawPact; void aukus; void sco

  // ── Alliances
  console.log('🤝 Creating alliances...')
  for (const a of alliancesData) {
    const idA = cMap.get(a.a)
    const idB = cMap.get(a.b)
    if (!idA || !idB) { console.warn(`  Skip alliance ${a.a}↔${a.b}`); continue }
    await prisma.alliance.create({
      data: {
        countryAId: idA, countryBId: idB,
        allianceType: a.type, motivation: a.motivation,
        startDate: new Date(a.start),
        endDate: a.end ? new Date(a.end) : null,
      }
    })
  }

  // ── Conflicts
  console.log('⚔️  Creating conflicts...')
  for (const cf of conflictsData) {
    const conflict = await prisma.conflict.create({
      data: {
        name: cf.name, type: cf.type, cause: cf.cause,
        startDate: new Date(cf.start),
        endDate: cf.end ? new Date(cf.end) : null,
      }
    })
    for (const p of cf.participants) {
      const countryId = cMap.get(p.iso)
      if (!countryId) { console.warn(`  Skip participant ${p.iso} in ${cf.name}`); continue }
      await prisma.conflictInvolvement.create({
        data: {
          conflictId: conflict.id, countryId,
          role: p.role,
          startDate: new Date(cf.start),
          endDate: cf.end ? new Date(cf.end) : null,
        }
      })
    }
  }

  // ── Sanctions
  console.log('🚫 Creating sanctions...')
  for (const s of sanctionsData) {
    const imposerId = cMap.get(s.imposer)
    const targetId = cMap.get(s.target)
    if (!imposerId || !targetId) { console.warn(`  Skip sanction ${s.imposer}→${s.target}`); continue }
    await prisma.sanction.create({
      data: {
        imposingCountryId: imposerId,
        targetCountryId: targetId,
        sanctionType: s.type,
        startDate: new Date(s.start),
        endDate: s.end ? new Date(s.end) : null,
      }
    })
  }

  // ── Trade Relations
  console.log('📦 Creating trade relations...')
  for (const t of tradeData) {
    const idA = cMap.get(t.a)
    const idB = cMap.get(t.b)
    if (!idA || !idB) { console.warn(`  Skip trade ${t.a}↔${t.b}`); continue }
    await prisma.tradeRelation.create({
      data: {
        countryAId: idA,
        countryBId: idB,
        year: t.year,
        tradeVolumeUsd: t.volume,
      }
    })
  }

  // ── Arms Transfers
  console.log('🚀 Creating arms transfers...')
  for (const at of armsTransfersData) {
    const exporterId = cMap.get(at.exp)
    const importerId = cMap.get(at.imp)
    if (!exporterId || !importerId) { console.warn(`  Skip arms transfer ${at.exp}→${at.imp}`); continue }
    await prisma.armsTransfer.create({
      data: {
        exporterId,
        importerId,
        weaponType: at.type,
        year: at.year,
        volumeTIV: at.tiv,
      }
    })
  }

  console.log('✅ Seeding complete!')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
