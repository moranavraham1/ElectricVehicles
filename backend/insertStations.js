require('dotenv').config();
const mongoose = require('mongoose');
const Station = require('./Station');

const MONGO_URI = process.env.MONGO_URI;

const stationData =
    [
        {
            "Station Name": "G Tzamerat ",
            "Address": "Nissim Aloni 10",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.089065,
            "Longitude": 34.797274,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Derech Yitshak Rabin 11",
            "Address": "Derech Yitzhak Rabin 11",
            "City": " Beit Shemesh",
            "Latitude": 31.747551,
            "Longitude": 34.993779,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Community Center ",
            "Address": "Derech Yitzhak Rabin 21",
            "City": " Beit Shemesh",
            "Latitude": 31.74437,
            "Longitude": 34.993723,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Park Center ",
            "Address": "Nahal Dolev 19",
            "City": " Beit Shemesh",
            "Latitude": 31.713455,
            "Longitude": 34.997996,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Yechezkel Hanavi 24 ",
            "Address": "Yehezkel HaNavi 24",
            "City": " Beit Shemesh",
            "Latitude": 31.703722,
            "Longitude": 34.984288,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "G Mall ",
            "Address": "Weizmann 207",
            "City": "Kfar Saba",
            "Latitude": 32.171844,
            "Longitude": 34.928718,
            "Operator": "EvEdge",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Kochav haTzafon ",
            "Address": "Meir Yaari 19",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.099936,
            "Longitude": 34.787715,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Center Galilee -roofed parking",
            "Address": "HaAgas 6",
            "City": "Rosh Pina",
            "Latitude": 32.969106,
            "Longitude": 35.550436,
            "Operator": "EvEdge",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Mikado Center ",
            "Address": "Aharon Becker 8",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.122754,
            "Longitude": 34.816393,
            "Operator": "EvEdge",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Arim mall ",
            "Address": "Muta Gor 14",
            "City": "Kefar Sava",
            "Latitude": 32.178219,
            "Longitude": 34.904289,
            "Operator": "EvEdge",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Amot Atrium ",
            "Address": "Zeev Jabotinsky 2",
            "City": " Ramat Gan",
            "Latitude": 32.082584,
            "Longitude": 34.801394,
            "Operator": "EvEdge",
            "Duplicate Count": 12.0
        },
        {
            "Station Name": "ToHa building ",
            "Address": "HaShalom Rd 3",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.072556,
            "Longitude": 34.795493,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "G Two ",
            "Address": "Yaldeyi Teheran 5",
            "City": "Rishon LeTsiyon",
            "Latitude": 31.98487,
            "Longitude": 34.769949,
            "Operator": "EvEdge",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "G Yavne",
            "Address": " HaKishon 1",
            "City": "Yavne",
            "Latitude": 31.88638,
            "Longitude": 34.734628,
            "Operator": "EvEdge",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "G City- external parking",
            "Address": "Sderot Moshe Dayan 3",
            "City": "Rishon LeTsiyon",
            "Latitude": 31.983922,
            "Longitude": 34.770083,
            "Operator": "EvEdge",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "G City - floor  -1",
            "Address": "Yaldeyi Teheran 3",
            "City": "Rishon LeTsiyon",
            "Latitude": 31.983332,
            "Longitude": 34.771935,
            "Operator": "EvEdge",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Kiryat Ono Mall",
            "Address": "King Solomon 37",
            "City": "Kiryat Ono",
            "Latitude": 32.055867,
            "Longitude": 34.863479,
            "Operator": "EvEdge",
            "Duplicate Count": 20.0
        },
        {
            "Station Name": "Campus Amot ",
            "Address": "HaMelacha 28",
            "City": "Holon",
            "Latitude": 32.010652,
            "Longitude": 34.796594,
            "Operator": "EvEdge",
            "Duplicate Count": 36.0
        },
        {
            "Station Name": "Amot Platinum Tower ",
            "Address": "Efal 25",
            "City": "Petah tikva",
            "Latitude": 32.095455,
            "Longitude": 34.847056,
            "Operator": "EvEdge",
            "Duplicate Count": 10.0
        },
        {
            "Station Name": "Municipality Of Beit Shemesh-Nachal Arugot",
            "Address": "Nahal Nitsanim 6",
            "City": "Beit Shemesh",
            "Latitude": 31.713307,
            "Longitude": 34.987863,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Municipality Of Beit Shemesh-Nachal HaKishon 25",
            "Address": "25 Nahal Kishon Blvd",
            "City": "Beit Shemesh",
            "Latitude": 31.713863,
            "Longitude": 34.988792,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "welfare department",
            "Address": "Aba Naamat 2",
            "City": "Beit Shemesh",
            "Latitude": 31.749748,
            "Longitude": 34.988868,
            "Operator": "EvEdge",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Municipality Of Beit Shemes-Herzl 9",
            "Address": "Herzl 9",
            "City": "Beit Shemesh",
            "Latitude": 31.749498,
            "Longitude": 34.988219,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Municipality Of Beit Shemes-Ha-Gefen 32",
            "Address": "The vine 32",
            "City": "Beit Shemesh",
            "Latitude": 31.746251,
            "Longitude": 34.982544,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Center Galilee- outside parking",
            "Address": "HaAgas 6",
            "City": "Rosh Pina",
            "Latitude": 32.969106,
            "Longitude": 35.550436,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "G Yokneam",
            "Address": "HaTamar 2",
            "City": "Yokne'am Illit",
            "Latitude": 32.660203,
            "Longitude": 35.105195,
            "Operator": "EvEdge",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Ha-Vered House",
            "Address": "Derech HaShalom 53",
            "City": " Givatayim",
            "Latitude": 32.067273,
            "Longitude": 34.803034,
            "Operator": "EvEdge",
            "Duplicate Count": 22.0
        },
        {
            "Station Name": "Ashtrom Life",
            "Address": "Ha-Yarkon 5",
            "City": "Bnei Brak",
            "Latitude": 32.095978,
            "Longitude": 34.823578,
            "Operator": "EvEdge",
            "Duplicate Count": 11.0
        },
        {
            "Station Name": "Beit Rakefet",
            "Address": "Zarhin 26",
            "City": "Raanana",
            "Latitude": 32.198332,
            "Longitude": 34.882427,
            "Operator": "EvEdge",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "G Savyon ",
            "Address": "HaShikma 1",
            "City": "Savyon ",
            "Latitude": 32.048879,
            "Longitude": 34.875043,
            "Operator": "EvEdge",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Rothschild Mall ",
            "Address": "Rothschild 45",
            "City": "Rishon LeTsiyon",
            "Latitude": 31.963596,
            "Longitude": 34.801445,
            "Operator": "EvEdge",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Ofer Malls -The Kiryon Mall Near Hapoalim Bank",
            "Address": "Akko Rd 192",
            "City": "Kiryat Bialik",
            "Latitude": 32.842031,
            "Longitude": 35.090259,
            "Operator": "EvEdge",
            "Duplicate Count": 10.0
        },
        {
            "Station Name": "Givon Parking Lot - Central Park ltd",
            "Address": "Arania Osvaldo 32",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.070152,
            "Longitude": 34.786102,
            "Operator": "EvEdge",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Shaar Hair Parking Lot",
            "Address": "Sderot Ben Gurion 22",
            "City": "Herzliya",
            "Latitude": 32.162966,
            "Longitude": 34.842067,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Nevo Hotel - Isrotel ltd",
            "Address": "Ein Bokek",
            "City": "Dead Sea",
            "Latitude": 31.192989,
            "Longitude": 35.361064,
            "Operator": "EvEdge",
            "Duplicate Count": 7.0
        },
        {
            "Station Name": "Ha-Palmakh Parking Lot - Ahuzot Hahof | Tel-Aviv Jaffa",
            "Address": "Yigal Alon 68",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.063034,
            "Longitude": 34.792241,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Zim Urban Complex ",
            "Address": "HaHadarim 7",
            "City": " Ganei Tikva",
            "Latitude": 32.065445,
            "Longitude": 34.875949,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Reit 1 ltd - Office Building  | Tel-Aviv Jaffa",
            "Address": "HaNechoshet 6",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.109774,
            "Longitude": 34.838574,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Culture Hall-Achu Municipallity",
            "Address": "Waitzman 34",
            "City": "Achu",
            "Latitude": 32.929882,
            "Longitude": 35.074478,
            "Operator": "EvEdge",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Weizman 2 ",
            "Address": "Weizman 2",
            "City": "Yehud Monosson",
            "Latitude": 32.027699,
            "Longitude": 34.891872,
            "Operator": "EvEdge",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Jabotinsky 3 ",
            "Address": "Zabutinsky 3",
            "City": "Hod HaSharon",
            "Latitude": 32.143535,
            "Longitude": 34.893177,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Mevaseret Mall ",
            "Address": "HaHotsvim Avenue 28",
            "City": "Mevaseret Zion",
            "Latitude": 31.789545,
            "Longitude": 35.140911,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Yona Avrech ltd Gas Station Sonol ",
            "Address": "Junction of road 90 ",
            "City": " Sde Eliezer",
            "Latitude": 33.046194,
            "Longitude": 35.570854,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "DC A.B Afula ltd - Toyota ",
            "Address": "Kehilat Tsiyon 23",
            "City": "Afula",
            "Latitude": 32.605743,
            "Longitude": 35.296108,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kitan Parking Lot - Ahuzot Hahof",
            "Address": "Kehilat Saloniki 7",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.114239,
            "Longitude": 34.82446,
            "Operator": "EvEdge",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Bar-Ilan University",
            "Address": "Bar-Ilan University Gate 10",
            "City": " Ramat Gan",
            "Latitude": 32.073454,
            "Longitude": 34.846045,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "The Hebrew University Har Hatsofim Campus ",
            "Address": "Har HaTsofim 0",
            "City": "Jerusalem",
            "Latitude": 31.7916,
            "Longitude": 35.243506,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "The Hebrew University Canada Hall - Safra Givat Ram Campus ",
            "Address": "Derech Brodetski",
            "City": "Jerusalem",
            "Latitude": 31.778065,
            "Longitude": 35.198312,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Hatakhana 46 (in front of the Coop Shop) ",
            "Address": "Ha-Takhana 46",
            "City": " Binyamina Giv'at Ada",
            "Latitude": 32.513884,
            "Longitude": 34.949243,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Isrotel Noga Hotel ",
            "Address": "Noga Hotel",
            "City": "Dead Sea",
            "Latitude": 31.198361,
            "Longitude": 35.361836,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Givon Parking Lot - Central Park ltd ",
            "Address": "HaArba'a  10",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.070326,
            "Longitude": 34.783855,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Isrotel Kedma Hotel ",
            "Address": "Sda Boker 5",
            "City": "Sde Boker",
            "Latitude": 30.874372,
            "Longitude": 34.788674,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Tkuma Parking Lot - Ahuzot Hahof ltd ",
            "Address": "HaMered 36",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.064718,
            "Longitude": 34.764678,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Bnei Dan Parking Lot - Ahuzot Hahof ltd ",
            "Address": "Ussishkin 7",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.095556,
            "Longitude": 34.778665,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ramat Gan Municipality-east Ayalon Mall",
            "Address": "Derech Sheshet HaYamim 22",
            "City": "Ramat Gan",
            "Latitude": 32.099232,
            "Longitude": 34.82808,
            "Operator": "EvEdge",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Basel In Front Of The Mall ",
            "Address": "Basel 1",
            "City": "Petah Tikva",
            "Latitude": 32.092211,
            "Longitude": 34.866737,
            "Operator": "EvEdge",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "HaHashmonaim 7 ",
            "Address": "HaHashmona'im 7",
            "City": "Rosh Haayin",
            "Latitude": 32.097125,
            "Longitude": 34.945357,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Shai Agnon 12",
            "Address": "Shai Agnon 12",
            "City": "Rosh Haayin",
            "Latitude": 32.084092,
            "Longitude": 34.967701,
            "Operator": "EvEdge",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "HaCarmel Parking Lot - Ahuzot Hahof ltd ",
            "Address": "HaCarmel 1",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.06701,
            "Longitude": 34.7666,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ahuzot Hahof ltd ",
            "Address": "Ha-Rav Shalom Shabazi 168",
            "City": "Rosh Ha'in",
            "Latitude": 32.08481,
            "Longitude": 34.962208,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Moshe Sharet ",
            "Address": "Moshe Sharet 11",
            "City": "Petah Tikva",
            "Latitude": 32.087906,
            "Longitude": 34.872887,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Calcala Parking lot - Ahuzot Hahof ltd ",
            "Address": "Dr. George Wise 16",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.10931,
            "Longitude": 34.80377,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Socialit Parking lot - Ahuzot Hahof ltd",
            "Address": "Shevet Binyamin 1",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.108386,
            "Longitude": 34.805484,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Saadia Gaon Parking lot - Ahuzot Hahof ltd ",
            "Address": "Tsiklag 7",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.067088,
            "Longitude": 34.782849,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ha-Sivim 49 ",
            "Address": "Ha-Sivim 49",
            "City": "Petah Tikva",
            "Latitude": 32.084006,
            "Longitude": 34.856162,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "HaRav Pinto ",
            "Address": "HaRav Pinto Mas'ud Asher 19",
            "City": "Petah Tikva",
            "Latitude": 32.101768,
            "Longitude": 34.894796,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ben Gurion Parking Lot ",
            "Address": "Sderot Ben Gurion 17",
            "City": "Herzliya",
            "Latitude": 32.164486,
            "Longitude": 34.842857,
            "Operator": "EvEdge",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "The Local Council Parking ",
            "Address": "Rahvat HaAtsma'ut 1",
            "City": "Mevaseret Zion",
            "Latitude": 31.794291,
            "Longitude": 35.145947,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Merkazim Parking lot - Ahuzot Hahof ltd ",
            "Address": "HaZerem 12",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.051303,
            "Longitude": 34.767158,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ha-Khashmal Parking Lot - Ahuzot Hahof ltd ",
            "Address": "Levontin 20",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.062199,
            "Longitude": 34.776238,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ravnitski Parking Lot - Ahuzot Hahof",
            "Address": "Ravnitski 6",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.066004,
            "Longitude": 34.789868,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Hutsot Golan Mall ",
            "Address": "Derech HaYekev 1",
            "City": "Katzrin",
            "Latitude": 32.987472,
            "Longitude": 35.70546,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Urban Policing -Matan ",
            "Address": "Hadar 84",
            "City": "Darom HaSharon Regional Council",
            "Latitude": 32.158779,
            "Longitude": 34.973621,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Mifal HaPais Parking Lot - Ahuzot Hahof ltd",
            "Address": "Leonardo da Vinci 5",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.072853,
            "Longitude": 34.784591,
            "Operator": "EvEdge",
            "Duplicate Count": 12.0
        },
        {
            "Station Name": "Moshe Shamir ",
            "Address": "Moshe Shamir 1",
            "City": "Petah Tikva",
            "Latitude": 32.098773,
            "Longitude": 34.874005,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gav-Yam Matam West Intel Israel ltd ",
            "Address": "Andrei Sakharov 9",
            "City": " Haifa",
            "Latitude": 32.787356,
            "Longitude": 34.957573,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "City Hall | North parking lot | Tel-Aviv Jaffa",
            "Address": "Shlomo Ibn Gabirol 69",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.082047,
            "Longitude": 34.780315,
            "Operator": "EvEdge",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Nof Hasadot -Kibbutz Negba ",
            "Address": "Negba 1",
            "City": "Yoav Regional Council",
            "Latitude": 31.658169,
            "Longitude": 34.684525,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ikea Israel ltd ",
            "Address": "Sderot Giborei Israel 1",
            "City": "Netanya",
            "Latitude": 32.273785,
            "Longitude": 34.859879,
            "Operator": "EvEdge",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Council's Parking lot",
            "Address": "Sieon 9",
            "City": "Katzrin",
            "Latitude": 32.99504,
            "Longitude": 35.68811,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Regional Council Parking Lot ",
            "Address": "Higher Galili Local Council",
            "City": "Mu'atza Ezorit Glil Elyon",
            "Latitude": 33.194477,
            "Longitude": 35.56858,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ram Cohen 3 ",
            "Address": "Ram Cohen 3",
            "City": "Yehud Monosson",
            "Latitude": 32.039146,
            "Longitude": 34.891602,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "The Municipality Parking Lot ",
            "Address": "Sderot Hayim Weizman 1",
            "City": " Ramla",
            "Latitude": 31.931183,
            "Longitude": 34.868696,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "South Park ",
            "Address": "Yitzhak Shamir 28",
            "City": "Givat Shmuel",
            "Latitude": 32.069374,
            "Longitude": 34.857342,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Bar Lev Industrials Park ",
            "Address": "High-Tech Park Bar-Lev",
            "City": "Bar Lev Tech Park",
            "Latitude": 32.905257,
            "Longitude": 35.188148,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Arik Ainstain 3-Floor minus 4 ",
            "Address": "Arik Ainstain 3",
            "City": "Herzliya",
            "Latitude": 32.162754,
            "Longitude": 34.814942,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Reit 1 ltd - Office Building  ",
            "Address": "HaMelacha 13",
            "City": "Rosh Haayin",
            "Latitude": 32.109156,
            "Longitude": 34.96826,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gav-Yam Matam Philips Medical Systems Technologies Ltd Outdoor Parking Lot ",
            "Address": "Nahum Het 16",
            "City": " Haifa",
            "Latitude": 32.786097,
            "Longitude": 34.958555,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Machsanei Hashuk ",
            "Address": "HaOrgim 8",
            "City": "Beer Sheva",
            "Latitude": 31.253538,
            "Longitude": 34.817612,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Beresheet Hotel ",
            "Address": "Beresheet Parking Lot 1",
            "City": "Mitzpe Ramon",
            "Latitude": 30.612049,
            "Longitude": 34.804794,
            "Operator": "EvEdge",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Hazi Hinam ltd ",
            "Address": "Altalena 3  Rishon LeZion",
            "City": "Rishon Letsiyon",
            "Latitude": 31.988772,
            "Longitude": 34.761697,
            "Operator": "EvEdge",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Center Of The Negev ",
            "Address": "Reuven Rubin 7",
            "City": "Beer Sheva",
            "Latitude": 31.258918,
            "Longitude": 34.797042,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dead Sea-Mall",
            "Address": "Ein Bokek",
            "City": "Dead Sea",
            "Latitude": 31.199266,
            "Longitude": 35.364035,
            "Operator": "EvEdge",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "DC Matam Motors E.V ltd - Toyota Agency ",
            "Address": "Nahum Het 16",
            "City": "Haifa",
            "Latitude": 32.784629,
            "Longitude": 34.957378,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Berel Katznelson High School ",
            "Address": "Azar 43",
            "City": "Kfar Saba",
            "Latitude": 32.184273,
            "Longitude": 34.908708,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Bar-Lev Junior High School ",
            "Address": "Prof. Dinor 44",
            "City": "Kfar Saba",
            "Latitude": 32.183092,
            "Longitude": 34.917966,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Lea Goldberg School Parking lot ",
            "Address": "Sapir 20",
            "City": "Kfar Saba",
            "Latitude": 32.196903,
            "Longitude": 34.88999,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Surkis School Parking lot ",
            "Address": "Ya'ara 4",
            "City": "Kfar Saba",
            "Latitude": 32.186183,
            "Longitude": 34.900147,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Renanim Mall ",
            "Address": "HaTa'asiya 20",
            "City": "Ra'anana",
            "Latitude": 32.196867,
            "Longitude": 34.878588,
            "Operator": "EvEdge",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Friendly Borochov Mall  ",
            "Address": "Borochov 54",
            "City": "Giv'atayim",
            "Latitude": 32.078901,
            "Longitude": 34.809616,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Maday Hachevra Parking lot - Ahuzot Hahof ltd ",
            "Address": "Chaim Levanon 293",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.110587,
            "Longitude": 34.802762,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Parking Lot ",
            "Address": "Zevulun Regional Council 1",
            "City": "Zevulun Regional Council",
            "Latitude": 32.793156,
            "Longitude": 35.117085,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Hamoshava Stadium ",
            "Address": "Derech Em Hamoshavot 12",
            "City": "Petah Tikva",
            "Latitude": 32.105779,
            "Longitude": 34.864342,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Municipality Of Kefar Sava ",
            "Address": "Ze'ev Belfer 1",
            "City": "Kefar Sava",
            "Latitude": 32.182259,
            "Longitude": 34.950069,
            "Operator": "EvEdge",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Local Council ",
            "Address": "Barne'a St Katzrin",
            "City": "Katzrin",
            "Latitude": 32.986965,
            "Longitude": 35.710323,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Beit Hadar A Parking lot - Ahuzot Hahof ltd",
            "Address": "HaRakevet 3",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.063877,
            "Longitude": 34.777034,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Carmel 2 Parking Lot - Ahuzot Hahof ",
            "Address": "Simtat HaCarmel 12",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.068642,
            "Longitude": 34.765644,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dubnov Parking lot - Ahuzot Hahof ltd ",
            "Address": "Dubnov 4",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.074084,
            "Longitude": 34.783799,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Parking Lot tzamarot High School ",
            "Address": "Shoham 12",
            "City": "Be'er Ya'akov",
            "Latitude": 31.936722,
            "Longitude": 34.823826,
            "Operator": "EvEdge",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Lev Talpiyot Shopping Centre ",
            "Address": "HaUman 17",
            "City": "Jerusalem",
            "Latitude": 31.750374,
            "Longitude": 35.209187,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Zamir 3 ",
            "Address": "Zamir 3",
            "City": "Kefar Sava",
            "Latitude": 32.183975,
            "Longitude": 34.927891,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Brurya Parking lot - Ahuzot Hahof ltd ",
            "Address": "Yigal Alon 151",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.078229,
            "Longitude": 34.796705,
            "Operator": "EvEdge",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Efal 23 Parking Lot -  Central Park ltd ",
            "Address": "Ef'al 23",
            "City": " Petah Tikva",
            "Latitude": 32.094902,
            "Longitude": 34.847042,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Pundak Neot Smadar ",
            "Address": "Pundak Neot Smadar - Shizafon Junction",
            "City": " Neot Smadar",
            "Latitude": 30.048007,
            "Longitude": 35.013962,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ulpanat Giv'at Shmue",
            "Address": "Yoni Netanyahu 8",
            "City": " Giv'at Shmue",
            "Latitude": 32.071774,
            "Longitude": 34.854645,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dentistry Parking lot - Ahuzot Hahof ltd ",
            "Address": "Klatzkin 4",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.117693,
            "Longitude": 34.804344,
            "Operator": "EvEdge",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Municipality Of Hod HaSharon",
            "Address": "Zalman Shazar 9",
            "City": "Hod HaSharon",
            "Latitude": 32.165371,
            "Longitude": 34.910896,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Mika Operating Gas Station ltd ",
            "Address": "Sderot Hen 13",
            "City": "Kiryat Bialik",
            "Latitude": 32.860936,
            "Longitude": 35.098903,
            "Operator": "EvEdge",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Samy Ofer Stadium ",
            "Address": "Pinkhas ve-Avraham Rutenberg 2",
            "City": "Haifa",
            "Latitude": 32.783104,
            "Longitude": 34.964302,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Hamered Parking lot - Ahuzot Hahof ltd",
            "Address": "HaMered 32",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.064162,
            "Longitude": 34.764267,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Hiria Recycling Park - Igudan ",
            "Address": "Hiria Recycling Park",
            "City": "Ganot",
            "Latitude": 32.026379,
            "Longitude": 34.825802,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Yitzhak Navon School Parking Lot ",
            "Address": "Arbel 4",
            "City": "Or Yehuda",
            "Latitude": 32.036484,
            "Longitude": 34.855763,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Municipality ",
            "Address": "HaTa'asiya  2",
            "City": "Yehud Monosson",
            "Latitude": 32.028091,
            "Longitude": 34.900539,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dizengoff Center Parking Lot",
            "Address": "Dizengoff 50",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.075427,
            "Longitude": 34.775517,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Avraham Giron ",
            "Address": "Avraham Giron 4",
            "City": "Yehud Monosson",
            "Latitude": 32.027233,
            "Longitude": 34.894531,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Or Yehoda Municipllity",
            "Address": "Metzada 16",
            "City": "Or Yehoda",
            "Latitude": 32.039936,
            "Longitude": 34.85865,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Yehud Monosson",
            "Address": "Tamar 19",
            "City": "Yehud Monosson",
            "Latitude": 32.028595,
            "Longitude": 34.871464,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ashkelon Municipality Parking Lot 28",
            "Address": "Ha-Shunit 5",
            "City": "Ashkelon",
            "Latitude": 31.680857,
            "Longitude": 34.556,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Beit Lessin Parking -  Central Park ltd ",
            "Address": "Yosef Lurya 8",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.077578,
            "Longitude": 34.771931,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Karta Parking Lot - Central Park ltd ",
            "Address": "Yitzhak Kariv 1",
            "City": "Jerusalem",
            "Latitude": 31.777104,
            "Longitude": 35.226229,
            "Operator": "EvEdge",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Karta Parking Lot - Central Park ltd ",
            "Address": "Yitzhak Kariv 1",
            "City": "Jerusalem",
            "Latitude": 31.777088,
            "Longitude": 35.226215,
            "Operator": "EvEdge",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Friendly Savyonim Mall",
            "Address": "Derech Moshe Dayan 3",
            "City": "Yehud",
            "Latitude": 32.030235,
            "Longitude": 34.878137,
            "Operator": "EvEdge",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "TLV Mall ",
            "Address": "HaHashmonaim 96",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.067808,
            "Longitude": 34.784525,
            "Operator": "EvEdge",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Lev Talpiyot Shopping Centre ",
            "Address": "HaUman 17",
            "City": "Jerusalem",
            "Latitude": 31.750578,
            "Longitude": 35.208578,
            "Operator": "EvEdge",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "CineMall ",
            "Address": "HaHistadrut Ave 55",
            "City": "Haifa",
            "Latitude": 32.793399,
            "Longitude": 35.037668,
            "Operator": "EvEdge",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Friendly Mall ",
            "Address": "HaMeginim 56",
            "City": "Gan Yavne",
            "Latitude": 31.79506,
            "Longitude": 34.704942,
            "Operator": "EvEdge",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Bialik Mall ",
            "Address": "Bialik 76",
            "City": "Ramat Gan",
            "Latitude": 32.085862,
            "Longitude": 34.811431,
            "Operator": "EvEdge",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Shderot Hagalim Twins Parking Lot - Central Park ltd ",
            "Address": "Abba Eban 8",
            "City": "Herzliya",
            "Latitude": 32.161641,
            "Longitude": 34.80883,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Rothschild Parking Lot - Ahuzot Hahof ltd ",
            "Address": "Rothschild Blvd 1",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.063007,
            "Longitude": 34.769093,
            "Operator": "EvEdge",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Beit Lessin Parking -  Central Park ltd ",
            "Address": "Yosef Lurya 8",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.077578,
            "Longitude": 34.771931,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Yarkon 78 Parking Lot - Central Park ltd ",
            "Address": "HaYarkon 78",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.076833,
            "Longitude": 34.76706,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gruzenberg Parking Lot - Central Park ltd ",
            "Address": "Gruzenberg 16",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.065972,
            "Longitude": 34.769862,
            "Operator": "EvEdge",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Ishpro Shopping Center ",
            "Address": "Sderot Malhei Israel 178",
            "City": "Kiryat Gat",
            "Latitude": 31.603334,
            "Longitude": 34.758071,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Arlozorov 17 Parking lot - Ahuzot Hahof ltd",
            "Address": "Arlozorov 17",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.087247,
            "Longitude": 34.773724,
            "Operator": "EvEdge",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Alia Square Parking Lot - Ahuzot Hahof ltd ",
            "Address": "Chlenov 22",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.057674,
            "Longitude": 34.77454,
            "Operator": "EvEdge",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Basel Parking lot - Ahuzot Hahof ltd ",
            "Address": "Ashtori HaFarhi  5",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.089934,
            "Longitude": 34.780149,
            "Operator": "EvEdge",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Beit Hanatziv Parking Lot ",
            "Address": "Hebron Rd 101",
            "City": "Jerusalem",
            "Latitude": 31.754874,
            "Longitude": 35.221685,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gav-Yam Management Services and Properties Maintenance ltd- Tamar 4 ",
            "Address": "David Fikes 5",
            "City": " Rehovot",
            "Latitude": 31.914232,
            "Longitude": 34.808271,
            "Operator": "EvEdge",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Psagot  Parking Lot - Central Park ltd ",
            "Address": "Rothschild Blvd 3",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.063456,
            "Longitude": 34.76947,
            "Operator": "EvEdge",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Event Hall Kadma",
            "Address": "Har'ot",
            "City": "Neve Ilan, Jerusalem",
            "Latitude": 31.8089754,
            "Longitude": 35.0751679,
            "Operator": "Ev4u",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Almond Hotel",
            "Address": "Hashayera",
            "City": "Neve Ilan, Jerusalem",
            "Latitude": 31.8083692,
            "Longitude": 35.0771287,
            "Operator": "Ev4u",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Neve Ilan Hotel",
            "Address": "Hashayera",
            "City": "Neve Ilan, Jerusalem",
            "Latitude": 31.8073845,
            "Longitude": 35.0760397,
            "Operator": "Ev4u",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Aseinda- Main Lobby",
            "Address": " Eskolot",
            "City": "Ma'alot Trasicha",
            "Latitude": 33.0097446,
            "Longitude": 35.2779196,
            "Operator": "Ev4u",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dimari Center Dimona - Commercial Floor Complex",
            "Address": " Golda Me'ir/Hama'afil",
            "City": "Dimona",
            "Latitude": 31.0724662,
            "Longitude": 35.0323138,
            "Operator": "Ev4u",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Dimari Center Kfar Saba - underground parking lot (2-)",
            "Address": " Angel 78",
            "City": "Kfar Saba",
            "Latitude": 32.1981313,
            "Longitude": 34.8906153,
            "Operator": "Ev4u",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Cinema City - parking lot floor 0",
            "Address": "Chita",
            "City": "Be'er Sheva",
            "Latitude": 31.2343595,
            "Longitude": 34.7999114,
            "Operator": "Ev4u",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Akro Golf - underground (2-)",
            "Address": "Pnechas Rozen 65",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.1151845,
            "Longitude": 34.8250462,
            "Operator": "Ev4u",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "odam 6 Harish –level 0 trade",
            "Address": "Odam 6",
            "City": "Harish",
            "Latitude": 32.4670387,
            "Longitude": 35.0414442,
            "Operator": "Ev4u",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "The Four Towers - Level (3-)",
            "Address": "Harba'a 32",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.0702679,
            "Longitude": 34.7860018,
            "Operator": "Ev4u",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Har Khotzavim",
            "Address": "Krit Meda  20",
            "City": "Jerusalem",
            "Latitude": 31.8050753,
            "Longitude": 35.2068331,
            "Operator": "Ev4u",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Jerusalem Theater - Main parking lot",
            "Address": "Shofen 3",
            "City": "Jerusalem",
            "Latitude": 31.7690636,
            "Longitude": 35.2143032,
            "Operator": "Ev4u",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Adgar Wave Public",
            "Address": "Wincentego Rzymowskiego 53",
            "City": "Warszawa",
            "Latitude": 52.177042,
            "Longitude": 21.001314,
            "Operator": "Greems",
            "Duplicate Count": 12.0
        },
        {
            "Station Name": "Adgar 360 Public",
            "Address": "Hashlosha 2",
            "City": "Tel Aviv",
            "Latitude": 32.061835,
            "Longitude": 34.790201,
            "Operator": "Greems",
            "Duplicate Count": 34.0
        },
        {
            "Station Name": "65 Havoda  - Level parking lot (0)",
            "Address": "Ha'avoda 65",
            "City": "Ashdod",
            "Latitude": 31.8089352,
            "Longitude": 34.6655428,
            "Operator": "Ev4u",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Adgar Tower Private",
            "Address": "35 Efal st",
            "City": "Petach Tikva",
            "Latitude": 32.098206,
            "Longitude": 34.847932,
            "Operator": "Greems",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Gilis - Egli Ramet Hagolan",
            "Address": "Kibbutz Beit Zera",
            "City": "Kibbutz Beit Zera",
            "Latitude": 32.831,
            "Longitude": 35.781,
            "Operator": "Ev4u",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Avilia Hadar Hamada",
            "Address": "Oppenheimer Hillel&Hanan 10-12",
            "City": "Rehovot",
            "Latitude": 31.910801,
            "Longitude": 34.807871,
            "Operator": "Greems",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Adgar 360 Private",
            "Address": "Hashlosha 2",
            "City": "Tel Aviv",
            "Latitude": 32.061768,
            "Longitude": 34.788541,
            "Operator": "Greems",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Mishek 73",
            "Address": "Moshav Ramot",
            "City": "Moshav Ramot",
            "Latitude": 32.847,
            "Longitude": 35.668,
            "Operator": "Ev4u",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Adgar Plaza Public",
            "Address": "Postępu 17A",
            "City": "Warszawa",
            "Latitude": 52.181012,
            "Longitude": 20.996208,
            "Operator": "Greems",
            "Duplicate Count": 13.0
        },
        {
            "Station Name": "Rom Bamot",
            "Address": "Tsela ha-Har St 21",
            "City": "Modi'in-Maccabim-Re'ut",
            "Latitude": 31.913669,
            "Longitude": 34.965694,
            "Operator": "Greems",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Adgar Tower Public",
            "Address": "35 Efal st",
            "City": "Petach Tikva",
            "Latitude": 32.098206,
            "Longitude": 34.847932,
            "Operator": "Greems",
            "Duplicate Count": 20.0
        },
        {
            "Station Name": "Ber Bechper",
            "Address": "Ber Bechper",
            "City": "Moshav Sharona",
            "Latitude": 32.7301316,
            "Longitude": 35.4592752,
            "Operator": "Ev4u",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Greems_Technologies",
            "Address": "arava 2",
            "City": "bahan",
            "Latitude": 32.353002,
            "Longitude": 35.022989,
            "Operator": "Greems",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Adgar Park Afek",
            "Address": "Hamelacha 16",
            "City": "Rosh Haain",
            "Latitude": 32.107618,
            "Longitude": 34.96953,
            "Operator": "Greems",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Adgar Park West",
            "Address": "al. Jerozolimskie 181",
            "City": "Warszawa",
            "Latitude": 52.211146,
            "Longitude": 20.952421,
            "Operator": "Greems",
            "Duplicate Count": 9.0
        },
        {
            "Station Name": "Hashacham",
            "Address": "Hashacham 3",
            "City": "Petach Tikva",
            "Latitude": 32.091128,
            "Longitude": 34.860252,
            "Operator": "Greems",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "B.S.R City Public - Level 2",
            "Address": "Totzrat Hartz 3",
            "City": "Petach Tikva",
            "Latitude": 32.0902142,
            "Longitude": 34.860298,
            "Operator": "ZenEv",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Cisco ",
            "Address": "Opek 8",
            "City": "Kisaria",
            "Latitude": 32.4850125,
            "Longitude": 34.9462307,
            "Operator": "ZenEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "MivneTzarchnia Polilfinim",
            "Address": "Shadrot Ha'histadrot 75",
            "City": "Haifa",
            "Latitude": 32.7982769,
            "Longitude": 35.0506264,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Polyethylene structure",
            "Address": "Shadrot Ha'histadrot 75",
            "City": "Haifa",
            "Latitude": 32.7982994,
            "Longitude": 35.0505084,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Polypropylene Structure",
            "Address": "Shadrot Ha'histadrot 75",
            "City": "Haifa",
            "Latitude": 32.7984753,
            "Longitude": 35.0501651,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Rehov 14 Structure",
            "Address": "Shadrot Ha'histadrot 75",
            "City": "Haifa",
            "Latitude": 32.7981912,
            "Longitude": 35.0506801,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Maintenance Building",
            "Address": "Shadrot Ha'histadrot 75",
            "City": "Haifa",
            "Latitude": 32.798588,
            "Longitude": 35.0504816,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Control Building",
            "Address": "Shadrot Ha'histadrot 75",
            "City": "Haifa",
            "Latitude": 32.7987143,
            "Longitude": 35.0503421,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gadiv Structure",
            "Address": "Shadrot Ha'histadrot 75",
            "City": "Haifa",
            "Latitude": 32.7982904,
            "Longitude": 35.050959,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Agripas 88 Parking Lot",
            "Address": "Agrips 88",
            "City": "Jerusalem",
            "Latitude": 31.7854373,
            "Longitude": 35.2095685,
            "Operator": "ZenEv",
            "Duplicate Count": 12.0
        },
        {
            "Station Name": "Koshi Rimon - Inn 101",
            "Address": "Drach Ha'arva 101",
            "City": "Eilat",
            "Latitude": 30.3076122,
            "Longitude": 35.1356011,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Delek Akko Argaman",
            "Address": "Drach Him",
            "City": "Acre",
            "Latitude": 32.9170812,
            "Longitude": 35.0819815,
            "Operator": "ZenEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Delek Katzrin",
            "Address": "Drach Hayen",
            "City": "Katzrin",
            "Latitude": 32.9860918,
            "Longitude": 35.7080314,
            "Operator": "ZenEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Migdal Or",
            "Address": "Habarzel 27",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.1099675,
            "Longitude": 34.8405233,
            "Operator": "ZenEv",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Shamir Products",
            "Address": "Shmir",
            "City": "Kibbutz Shamir",
            "Latitude": 33.166754,
            "Longitude": 35.659949,
            "Operator": "ZenEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Shamir SPO",
            "Address": "Shmir",
            "City": "Kibbutz Shamir",
            "Latitude": 33.166754,
            "Longitude": 35.659949,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Shamir Kibbutz Garage",
            "Address": "Shmir",
            "City": "Kibbutz Shamir",
            "Latitude": 33.166754,
            "Longitude": 35.659949,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Opposite Building 6 - Projects",
            "Address": "Shadrot Ha'histadrot 75",
            "City": "Haifa",
            "Latitude": 32.7984167,
            "Longitude": 35.0507444,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Building 4",
            "Address": "Shadrot Ha'histadrot 75",
            "City": "Haifa",
            "Latitude": 32.7987233,
            "Longitude": 35.0505299,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Entrance Complex",
            "Address": "Shadrot Ha'histadrot 75",
            "City": "Haifa",
            "Latitude": 32.7988478,
            "Longitude": 35.0504387,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Electricity Center",
            "Address": "Derech Kishon",
            "City": "agur",
            "Latitude": 32.7464172,
            "Longitude": 35.0777669,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Smart Shooter Parking - Right Side",
            "Address": "Green Mountain Road",
            "City": "Yagur",
            "Latitude": 32.7386198,
            "Longitude": 35.0809697,
            "Operator": "ZenEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Smart Shooter Parking - Left Side",
            "Address": "Green Mountain Road",
            "City": "Yagur",
            "Latitude": 32.7384664,
            "Longitude": 35.0807712,
            "Operator": "ZenEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Electrical Room - Yad LaMagenim",
            "Address": "Yad LaMagenim",
            "City": "Yagur",
            "Latitude": 32.7423395,
            "Longitude": 35.0743711,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "HaMishtala Neighborhood",
            "Address": "Derech HaKishon (Kishon Road)",
            "City": "Yagur",
            "Latitude": 32.7436721,
            "Longitude": 35.0779545,
            "Operator": "ZenEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Delek Afikim",
            "Address": "Kibbutz Afikim Junction",
            "City": "Afikim",
            "Latitude": 32.67865,
            "Longitude": 35.57959,
            "Operator": "ZenEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Kibbutz Palmahim",
            "Address": "HaShahaf Street",
            "City": "Kibbutz Palmachim",
            "Latitude": 31.9341173,
            "Longitude": 34.706001,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "My Baby ",
            "Address": "Yarka Industrial Zone - MYBABY",
            "City": "Yarka",
            "Latitude": 32.9467723,
            "Longitude": 35.1725194,
            "Operator": "ZenEv",
            "Duplicate Count": 12.0
        },
        {
            "Station Name": "WIZO Tseitli",
            "Address": "Rivka Ziv",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.0790983,
            "Longitude": 34.7867053,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ya'arim Hotel",
            "Address": "Ya'arim Hotel",
            "City": "Ma'ale HaHamisha",
            "Latitude": 31.8157291,
            "Longitude": 35.1172027,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gordonia Hotel",
            "Address": "Gordonia Hotel",
            "City": "Ma'ale HaHamisha",
            "Latitude": 31.8149704,
            "Longitude": 35.1168946,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kramim Park AC",
            "Address": "Kramim Park",
            "City": "Kiryat Anavim",
            "Latitude": 31.8100441,
            "Longitude": 35.1208862,
            "Operator": "ZenEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Kramim Park DC",
            "Address": "Kramim Park",
            "City": "Kiryat Anavim",
            "Latitude": 31.809913,
            "Longitude": 35.120842,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Fast Lane AC",
            "Address": "Fast Lane - Shapirim",
            "City": "Or Yehuda",
            "Latitude": 32.0013429,
            "Longitude": 34.8426764,
            "Operator": "ZenEv",
            "Duplicate Count": 80.0
        },
        {
            "Station Name": "Fast Lane DC",
            "Address": "Fast Lane - Shapirim",
            "City": "Or Yehuda",
            "Latitude": 32.0013429,
            "Longitude": 34.8426764,
            "Operator": "ZenEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Vitrea",
            "Address": "Avraham Buma Shavit 3",
            "City": "Rishon Lezion",
            "Latitude": 31.9505694,
            "Longitude": 34.7682591,
            "Operator": "ViMore",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Amot ParkTech",
            "Address": "Sderot Menachem Begin 5",
            "City": "Beit Dagan",
            "Latitude": 32.0033356,
            "Longitude": 34.8270821,
            "Operator": "ViMore",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Beit HaRel",
            "Address": "Zeev Jabotinsky Street 3",
            "City": "Ramat Gan",
            "Latitude": 32.0838424,
            "Longitude": 34.8025709,
            "Operator": "ViMore",
            "Duplicate Count": 16.0
        },
        {
            "Station Name": "Rani Zim",
            "Address": "Rani Zim Tayibe 7",
            "City": "Tayibe",
            "Latitude": 32.2473157,
            "Longitude": 34.9949989,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": " Na'an - Dolev",
            "Address": "Kibbutz Na'an - Dolev",
            "City": "Na'an",
            "Latitude": 31.883208,
            "Longitude": 34.859237,
            "Operator": "ViMore",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kibbutz Na'an - Dekalim Neighborhood",
            "Address": "Dekelim Neighborhood (Sha'ar Yakhin)",
            "City": "Na'an",
            "Latitude": 31.883208,
            "Longitude": 34.859237,
            "Operator": "ViMore",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Kibbutz Na'an (Post Office)",
            "Address": "undefined undefined",
            "City": "Na'an",
            "Latitude": 31.883208,
            "Longitude": 34.859237,
            "Operator": "ViMore",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Ashdar Parking Lot",
            "Address": "Yigal Alon Street 88",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.0666613,
            "Longitude": 34.7933677,
            "Operator": "ViMore",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Clal Insurance - Gisin",
            "Address": "Avshalom Gissin Street 78",
            "City": "Petah Tikva",
            "Latitude": 32.0978079,
            "Longitude": 34.8643619,
            "Operator": "ViMore",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Kibbutz Na'an - Football Field",
            "Address": "Football Field",
            "City": "Na'an",
            "Latitude": 31.883208,
            "Longitude": 34.859237,
            "Operator": "ViMore",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kibbutz Na'an - Football Field",
            "Address": "Football Field",
            "City": "Na'an",
            "Latitude": 31.883208,
            "Longitude": 34.859237,
            "Operator": "ViMore",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "HaTzfira Parking Lot",
            "Address": "HaTsfira Street 2",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.0621121,
            "Longitude": 34.7807926,
            "Operator": "ViMore",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Tirah Complex 7 - Rani Zim",
            "Address": "Yafo Road",
            "City": "Tirah",
            "Latitude": 32.2284536,
            "Longitude": 34.9424063,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dov Salok - VIMORE",
            "Address": "Smadar 7",
            "City": "Karmei Yosef",
            "Latitude": 31.8505841,
            "Longitude": 34.9166019,
            "Operator": "ViMore",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Urban Zim ",
            "Address": "Derech HaYam 9, KES",
            "City": "Kfar Saba",
            "Latitude": 32.1852246,
            "Longitude": 34.9536829,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kibbutz Mahaniyim - Secretariat",
            "Address": "Kibbutz Machanayim",
            "City": "Kibbutz Mahnayim",
            "Latitude": 32.988566,
            "Longitude": 35.5710509,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Golbary - Logistics Center",
            "Address": "Tzrifin Industries",
            "City": "Tzrifin",
            "Latitude": 31.957328,
            "Longitude": 34.840566,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Tamara Hotel",
            "Address": "Golani 11",
            "City": "Ashkelon",
            "Latitude": 31.6829759,
            "Longitude": 34.5615418,
            "Operator": "ZenEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Keren HaYesod",
            "Address": "Keren HaYesod 2",
            "City": "Tirat Carmel",
            "Latitude": 32.7686744,
            "Longitude": 34.9683042,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Legacy Hotel",
            "Address": "Legacy Hotel",
            "City": "Nazareth",
            "Latitude": 32.7011487,
            "Longitude": 35.2987802,
            "Operator": "ZenEv",
            "Duplicate Count": 10.0
        },
        {
            "Station Name": "Tapuz - HaTaasiya",
            "Address": "Paris 2",
            "City": "Sderot",
            "Latitude": 31.5222305,
            "Longitude": 34.607964,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Tapuz Gas Station",
            "Address": "Beit HaGadi Junction",
            "City": "Netivot",
            "Latitude": 31.4162784,
            "Longitude": 34.6052555,
            "Operator": "ZenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Bil Almoustafa Center",
            "Address": "Al-Baladiya",
            "City": "Arraba",
            "Latitude": 32.8564,
            "Longitude": 35.3263,
            "Operator": "Enova",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Nazareth Fast Charging Station",
            "Address": "72 Bilal Street",
            "City": "Nazareth",
            "Latitude": 32.7205,
            "Longitude": 35.2961,
            "Operator": "Enova",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Merhavim Educational Campus",
            "Address": "Aleh Negev",
            "City": "Aleh Negev",
            "Latitude": 31.3156,
            "Longitude": 34.5964,
            "Operator": "Enova",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Pango Innova - Authorized Personnel Only",
            "Address": "3 Shacham Street",
            "City": "Petah Tikva",
            "Latitude": 32.0908,
            "Longitude": 34.8599,
            "Operator": "Enova",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Beit HaLohem",
            "Address": "Beit HaLohem",
            "City": "Be'er Sheva",
            "Latitude": 31.2581,
            "Longitude": 34.8238,
            "Operator": "Enova",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Inbal Hotel",
            "Address": "3 Ze'ev Jabotinsky Street",
            "City": "Jerusalem",
            "Latitude": 31.7713,
            "Longitude": 35.2221,
            "Operator": "Enova",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Beit HaLohem",
            "Address": "101 Tzorfat Road",
            "City": "Haifa",
            "Latitude": 32.8258,
            "Longitude": 34.9676,
            "Operator": "Enova",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Beit HaLohem",
            "Address": "Jerusalem",
            "City": "Jerusalem",
            "Latitude": 31.7498,
            "Longitude": 35.1769,
            "Operator": "Enova",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Gas Station",
            "Address": "Deir Hanna",
            "City": "Deir Hanna",
            "Latitude": 32.8586,
            "Longitude": 35.3817,
            "Operator": "Enova",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Global Towers Public",
            "Address": "1 Derech Yitshak Rabin",
            "City": "Petah Tikva",
            "Latitude": 32.0907,
            "Longitude": 34.8627,
            "Operator": "Enova",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Herzl",
            "Address": "136 Herzl Street",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.0528,
            "Longitude": 34.7701,
            "Operator": "Enova",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Merhavim Council Building",
            "Address": "Gilat",
            "City": "Gilat",
            "Latitude": 31.3383,
            "Longitude": 34.6516,
            "Operator": "Enova",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gas Station - Ya'ad",
            "Address": "Kafr Kanna",
            "City": "Kafr Kanna",
            "Latitude": 32.7563,
            "Longitude": 35.3448,
            "Operator": "Enova",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Nitzanim Beach",
            "Address": "Nitzanim Beach",
            "City": "Nitzanim Beach",
            "Latitude": 31.7449,
            "Longitude": 34.6005,
            "Operator": "Enova",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Nitzanim Beach-Hotel Guests Only",
            "Address": "Eilat",
            "City": "Eilat",
            "Latitude": 29.5521,
            "Longitude": 34.9593,
            "Operator": "Enova",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Caesar Hotel - Hotel Guests Only",
            "Address": " HaTayelet 103",
            "City": "Tiberias",
            "Latitude": 32.7877,
            "Longitude": 35.5423,
            "Operator": "Enova",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Caesar Hotel - Hotel Guests Only",
            "Address": "208 Jaffa Street",
            "City": "Jerusalem",
            "Latitude": 31.7886,
            "Longitude": 35.2071,
            "Operator": "Enova",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Intro Netanya",
            "Address": "2 HaKadar Street",
            "City": "Netanya",
            "Latitude": 32.3227,
            "Longitude": 34.8735,
            "Operator": "Enova",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Davidi Center",
            "Address": "Machal 1",
            "City": "Ashkelon",
            "Latitude": 31.6809,
            "Longitude": 34.57,
            "Operator": "Enova",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Public Complex Opposite the Mountains",
            "Address": "Gilboa Street 1",
            "City": "Nof HaGalil",
            "Latitude": 32.7036,
            "Longitude": 35.3186,
            "Operator": "Enova",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Migdal Tzedek",
            "Address": "Rosh Haayin",
            "City": "Rosh Haayin",
            "Latitude": 32.0809,
            "Longitude": 34.9571,
            "Operator": "Enova",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Almog Commercial Center",
            "Address": " ",
            "City": "Be'er Ya'akov",
            "Latitude": 31.941867,
            "Longitude": 34.843379,
            "Operator": "SevenEv",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Daniel Manor - Event Hall",
            "Address": "Yosef Samelo Street ",
            "City": "Netivot",
            "Latitude": 31.421663,
            "Longitude": 34.602273,
            "Operator": "SevenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ami Center",
            "Address": " ",
            "City": "Petah Tikva",
            "Latitude": 32.103332,
            "Longitude": 34.882197,
            "Operator": "SevenEv",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Iraqi Meat Source",
            "Address": " ",
            "City": "Tira",
            "Latitude": 32.233398,
            "Longitude": 34.95934,
            "Operator": "SevenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Moshav Nacha",
            "Address": " ",
            "City": "Naham",
            "Latitude": 31.766478,
            "Longitude": 35.003572,
            "Operator": "SevenEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Dream Island",
            "Address": " ",
            "City": "Sde Yoav",
            "Latitude": 31.644626,
            "Longitude": 34.685108,
            "Operator": "SevenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Saban Offices - Euro Safety Building",
            "Address": "HaManor 2",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.051742,
            "Longitude": 34.771646,
            "Operator": "SevenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dizengoff Center",
            "Address": " ",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.075108,
            "Longitude": 34.774942,
            "Operator": "SevenEv",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Amara Event Hall",
            "Address": " ",
            "City": NaN,
            "Latitude": 31.9161,
            "Longitude": 34.777889,
            "Operator": "SevenEv",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Hatzeva - Guestrooms",
            "Address": " ",
            "City": "Hazeva",
            "Latitude": 30.764268,
            "Longitude": 35.278589,
            "Operator": "SevenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Hyper Cohen Netivot - DC Charging Station",
            "Address": "Ba'alei ha-Melakha Street 8",
            "City": "Netivot",
            "Latitude": 31.418246,
            "Longitude": 34.594261,
            "Operator": "SevenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "AC Charging Stations",
            "Address": "Arik Einstein Street 3",
            "City": "Herzliya",
            "Latitude": 32.162541,
            "Longitude": 34.814381,
            "Operator": "SevenEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Aliba Event Hall",
            "Address": "Afikim BaNegev",
            "City": "Ofakim",
            "Latitude": 31.320782,
            "Longitude": 34.621958,
            "Operator": "SevenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Meet Me",
            "Address": "Ezra Yesodi Street 1",
            "City": "Ashkelon",
            "Latitude": 31.660114,
            "Longitude": 34.601824,
            "Operator": "SevenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Mamilla Event Hall",
            "Address": "HaOrgim Street 3",
            "City": "Ashdod",
            "Latitude": 31.810469,
            "Longitude": 34.663181,
            "Operator": "SevenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kfar Hasidim",
            "Address": " ",
            "City": NaN,
            "Latitude": 32.752332,
            "Longitude": 35.094315,
            "Operator": "SevenEv",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Nof Yam Center",
            "Address": " ",
            "City": "Or Akiva",
            "Latitude": 32.504353,
            "Longitude": 34.917956,
            "Operator": "SevenEv",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Minkin Center ",
            "Address": " ",
            "City": "Modi'in",
            "Latitude": 31.892243,
            "Longitude": 35.00874,
            "Operator": "SevenEv",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Hatzeva - Khan",
            "Address": " ",
            "City": NaN,
            "Latitude": 30.781835,
            "Longitude": 35.250476,
            "Operator": "SevenEv",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Fast Charging Station DC - Hasson",
            "Address": "HaKorem 1",
            "City": "Afula",
            "Latitude": 32.602362,
            "Longitude": 35.29874,
            "Operator": "SevenEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Nahal Oz Secretariat",
            "Address": " ",
            "City": "Nahal Oz",
            "Latitude": 31.472638,
            "Longitude": 34.500016,
            "Operator": "DoralUrban",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kunetra",
            "Address": " ",
            "City": "Nahal Oz",
            "Latitude": 31.472988,
            "Longitude": 34.499734,
            "Operator": "DoralUrban",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sadot Bet",
            "Address": " ",
            "City": "Nahal Oz",
            "Latitude": 31.470588,
            "Longitude": 34.497797,
            "Operator": "DoralUrban",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gat Center AC",
            "Address": "Avnei HaChoshen Boulevard 1",
            "City": "Kiryat Gat",
            "Latitude": 31.624256,
            "Longitude": 34.773966,
            "Operator": "DoralUrban",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Space Restaurant",
            "Address": "Ha-Zayit St ",
            "City": "Emunim",
            "Latitude": 31.746438,
            "Longitude": 34.670063,
            "Operator": "DoralUrban",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ami Center",
            "Address": "Menachem Begin Boulevard 30",
            "City": " Givat Shmuel",
            "Latitude": 32.075658,
            "Longitude": 34.854535,
            "Operator": "SevenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Hana Senesh DC",
            "Address": "Sderot HaPalmach ",
            "City": "Ashdod",
            "Latitude": 31.800159,
            "Longitude": 34.662774,
            "Operator": "DoralUrban",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ami Center",
            "Address": "HaAri 23",
            "City": "Netanya",
            "Latitude": 32.311896,
            "Longitude": 34.87488,
            "Operator": "SevenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gat Center DC",
            "Address": " ",
            "City": NaN,
            "Latitude": 31.624256,
            "Longitude": 34.773966,
            "Operator": "DoralUrban",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "AMPA HaMasger",
            "Address": "HaMasger Street 9",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.062137,
            "Longitude": 34.784627,
            "Operator": "DoralUrban",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Sapir Complex ",
            "Address": "Zavitan 128",
            "City": " Katzrin",
            "Latitude": 32.992696,
            "Longitude": 35.680481,
            "Operator": "SevenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "NEXT Public",
            "Address": "Omarim Street 6",
            "City": "Omer",
            "Latitude": 31.272346,
            "Longitude": 34.837073,
            "Operator": "DoralUrban",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ami Center",
            "Address": "HaTivat HaNachal",
            "City": "Hadera",
            "Latitude": 32.431649,
            "Longitude": 34.931922,
            "Operator": "SevenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ma'ale Gilboa Secretariat",
            "Address": " ",
            "City": "Ma'ale Gilboa",
            "Latitude": 32.476065,
            "Longitude": 35.420637,
            "Operator": "DoralUrban",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Nitzan Educational Campus",
            "Address": "Shavei Darom, P.O. Box 18",
            "City": "Nitzan",
            "Latitude": 31.741261,
            "Longitude": 34.635371,
            "Operator": "SevenEv",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Dani Mas 13-15",
            "Address": "Dani Mas Street 13",
            "City": "Ramla",
            "Latitude": 31.927955,
            "Longitude": 34.869149,
            "Operator": "DoralUrban",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ami Center",
            "Address": "Moshe Lerer 1",
            "City": "Ness Ziona",
            "Latitude": 31.930256,
            "Longitude": 34.787293,
            "Operator": "SevenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kfar Ruppin Public 02",
            "Address": " ",
            "City": "Kfar Ruppin",
            "Latitude": 32.459488,
            "Longitude": 35.557672,
            "Operator": "DoralUrban",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kfar Ruppin Public 03",
            "Address": " ",
            "City": "Kfar Ruppin",
            "Latitude": 32.457588,
            "Longitude": 35.558047,
            "Operator": "DoralUrban",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kfar Ruppin Public 01",
            "Address": " ",
            "City": "Kfar Ruppin",
            "Latitude": 32.458563,
            "Longitude": 35.555609,
            "Operator": "DoralUrban",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kfar Ruppin Public 04",
            "Address": " ",
            "City": "Kfar Ruppin",
            "Latitude": 32.458988,
            "Longitude": 35.554453,
            "Operator": "DoralUrban",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "AC Charging Stations - Hasson",
            "Address": "HaKorem Street 1",
            "City": "Afula",
            "Latitude": 32.602362,
            "Longitude": 35.29874,
            "Operator": "SevenEv",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Clalit Clinic",
            "Address": " ",
            "City": "Gvar'am",
            "Latitude": 31.592788,
            "Longitude": 34.613484,
            "Operator": "DoralUrban",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Triangle Parking Lot ",
            "Address": "Herzl 30",
            "City": "Rishon Lezion",
            "Latitude": 31.969029,
            "Longitude": 34.804052,
            "Operator": "SevenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gan Ofer Parking Lot",
            "Address": "Malkhi Yisrael Street 13",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.080583,
            "Longitude": 34.779721,
            "Operator": "DoralUrban",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Afula Adir Home - DC",
            "Address": " ",
            "City": NaN,
            "Latitude": 32.584913,
            "Longitude": 35.293941,
            "Operator": "SevenEv",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Hana Senesh AC",
            "Address": "Sderot HaPalmach ",
            "City": "Ashdod",
            "Latitude": 31.800159,
            "Longitude": 34.662774,
            "Operator": "DoralUrban",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Pool",
            "Address": " ",
            "City": "Ramot Menashe",
            "Latitude": 32.599199,
            "Longitude": 35.058472,
            "Operator": "SevenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "VITA Parking Lot 1",
            "Address": "Bar Kochva Street 23",
            "City": "Bnei Brak",
            "Latitude": 32.093875,
            "Longitude": 34.822834,
            "Operator": "DoralUrban",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Terminal",
            "Address": " ",
            "City": "Ramot Menashe",
            "Latitude": 32.595757,
            "Longitude": 35.054929,
            "Operator": "SevenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "VITA Parking Lot 2",
            "Address": "Bar Kochva Street 23",
            "City": "Bnei Brak",
            "Latitude": 32.093875,
            "Longitude": 34.822834,
            "Operator": "DoralUrban",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Usha Public 01",
            "Address": " ",
            "City": NaN,
            "Latitude": 32.79682,
            "Longitude": 35.115015,
            "Operator": "DoralUrban",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Usha Public 02",
            "Address": " ",
            "City": NaN,
            "Latitude": 32.79663,
            "Longitude": 35.112264,
            "Operator": "DoralUrban",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Post Office",
            "Address": " ",
            "City": "Ramot Menashe",
            "Latitude": 32.597042,
            "Longitude": 35.057177,
            "Operator": "SevenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Usha Public 03",
            "Address": " ",
            "City": NaN,
            "Latitude": 32.79527,
            "Longitude": 35.115665,
            "Operator": "DoralUrban",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Yehezkel",
            "Address": " ",
            "City": "Ramot Menashe",
            "Latitude": 32.598796,
            "Longitude": 35.054788,
            "Operator": "SevenEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Beit Alfa Public 02",
            "Address": " ",
            "City": NaN,
            "Latitude": 32.51603,
            "Longitude": 35.428326,
            "Operator": "DoralUrban",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Beit Alfa Public 04",
            "Address": " ",
            "City": NaN,
            "Latitude": 32.516379,
            "Longitude": 35.426386,
            "Operator": "DoralUrban",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Beit Alfa Public 05",
            "Address": " ",
            "City": NaN,
            "Latitude": 32.516502,
            "Longitude": 35.431348,
            "Operator": "DoralUrban",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Reshafim Public 01",
            "Address": " ",
            "City": NaN,
            "Latitude": 32.48098,
            "Longitude": 35.476797,
            "Operator": "DoralUrban",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Reshafim Public 02",
            "Address": " ",
            "City": NaN,
            "Latitude": 32.47969,
            "Longitude": 35.475041,
            "Operator": "DoralUrban",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Reshafim Public 03",
            "Address": " ",
            "City": NaN,
            "Latitude": 32.482625,
            "Longitude": 35.478037,
            "Operator": "DoralUrban",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Meirav Public 01",
            "Address": " ",
            "City": NaN,
            "Latitude": 32.451693,
            "Longitude": 35.421968,
            "Operator": "DoralUrban",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Meirav Public 02",
            "Address": " ",
            "City": NaN,
            "Latitude": 32.450968,
            "Longitude": 35.42344,
            "Operator": "DoralUrban",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Meirav Public 03",
            "Address": " ",
            "City": NaN,
            "Latitude": 32.452812,
            "Longitude": 35.421648,
            "Operator": "DoralUrban",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Yahel Public 01",
            "Address": " ",
            "City": NaN,
            "Latitude": 30.082675,
            "Longitude": 35.128761,
            "Operator": "DoralUrban",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Yahel Public 02",
            "Address": " ",
            "City": NaN,
            "Latitude": 30.082675,
            "Longitude": 35.128761,
            "Operator": "DoralUrban",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Nevel David Hotel",
            "Address": "Sderot Oved Ben Ami 41",
            "City": "Netanya",
            "Latitude": 32.313316,
            "Longitude": 34.846464,
            "Operator": "DoralUrban",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Nova Hotel",
            "Address": "Sderot Hativat HaNegev 6",
            "City": "Eilat",
            "Latitude": 29.557859,
            "Longitude": 34.953979,
            "Operator": "DoralUrban",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Beit Berl Public 01",
            "Address": " ",
            "City": NaN,
            "Latitude": 32.200325,
            "Longitude": 34.923401,
            "Operator": "DoralUrban",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Roaming Testing",
            "Address": "Ha-Saifan St 9  Ein Vered  4069600  Israel",
            "City": "Ein Vered",
            "Latitude": 32.2703,
            "Longitude": 34.9325,
            "Operator": "Nofar",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Yizra'el",
            "Address": "Yizre'el  Israel",
            "City": "Yizre'el",
            "Latitude": 32.5626,
            "Longitude": 35.3194,
            "Operator": "Nofar",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Or HaNer - Office Building",
            "Address": "Or HaNer",
            "City": "Or HaNer",
            "Latitude": 31.5586,
            "Longitude": 34.6039,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Or HaNer - New Neighborhood B",
            "Address": "Or HaNer",
            "City": "Or HaNer",
            "Latitude": 31.5576,
            "Longitude": 34.5964,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Or HaNer - New Neighborhood C",
            "Address": "Or HaNer",
            "City": "Or HaNer",
            "Latitude": 31.5592,
            "Longitude": 34.5948,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Merhavia - Western Pool",
            "Address": "Merhavia (Kibbuts)",
            "City": "Merhavia (Kibbuts)",
            "Latitude": 32.6031,
            "Longitude": 35.3084,
            "Operator": "Nofar",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Kfar Etzion",
            "Address": "Kfar Ezion",
            "City": "Kfar Ezion",
            "Latitude": 31.6527,
            "Longitude": 35.116,
            "Operator": "Nofar",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Givat Oz - Lower Public Parking",
            "Address": "Givat Oz",
            "City": "Givat Oz",
            "Latitude": 32.5556,
            "Longitude": 35.1985,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Givat Oz - Upper Public Parking",
            "Address": "Givat Oz",
            "City": "Givat Oz",
            "Latitude": 32.5537,
            "Longitude": 35.1996,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kramim Dining Hall",
            "Address": "Kramim",
            "City": "Kramim",
            "Latitude": 31.3337,
            "Longitude": 34.9186,
            "Operator": "Nofar",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Sde Nehemia - Kolbo",
            "Address": "Sde Nehemia",
            "City": "Sde Nehemia",
            "Latitude": 33.1874,
            "Longitude": 35.6224,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sde Nehemia - Rafi’s Garden",
            "Address": "Sde Nehemia",
            "City": "Sde Nehemia",
            "Latitude": 33.188,
            "Longitude": 35.6206,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Main Building",
            "Address": "RXGV+MJQ Haifa  Israel",
            "City": "Haifa",
            "Latitude": 32.8267,
            "Longitude": 34.9941,
            "Operator": "Nofar",
            "Duplicate Count": 22.0
        },
        {
            "Station Name": "TPO",
            "Address": "RXGV+MJQ Haifa  Israel",
            "City": "Haifa",
            "Latitude": 32.8267,
            "Longitude": 34.9941,
            "Operator": "Nofar",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Substation - 0",
            "Address": "RXGV+MJQ Haifa  Israel",
            "City": "Haifa",
            "Latitude": 32.8267,
            "Longitude": 34.9941,
            "Operator": "Nofar",
            "Duplicate Count": 14.0
        },
        {
            "Station Name": "Hannaton - Sports Field",
            "Address": "7 Geshmei Bracha ",
            "City": "Hanaton",
            "Latitude": 32.7842,
            "Longitude": 35.2426,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Hannaton - Kindergarten",
            "Address": "Hanaton",
            "City": "Hanaton",
            "Latitude": 32.7842,
            "Longitude": 35.2447,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Galilion Hotel",
            "Address": "Merkaz Kah",
            "City": "Merkaz Kah",
            "Latitude": 33.1175,
            "Longitude": 35.5733,
            "Operator": "Nofar",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Lahav - Factory",
            "Address": "Lahav",
            "City": "Lahav",
            "Latitude": 31.3769,
            "Longitude": 34.8709,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Lahav - Dining Hall",
            "Address": "Lahav",
            "City": "Lahav",
            "Latitude": 31.38,
            "Longitude": 34.8701,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ketura - Kibbutz Entrance",
            "Address": "Ketura",
            "City": "Ketura",
            "Latitude": 29.9702,
            "Longitude": 35.0616,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ketura - Western Neighborhood",
            "Address": "Ketura",
            "City": "Ketura",
            "Latitude": 29.9732,
            "Longitude": 35.0606,
            "Operator": "Nofar",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ketura - Guesthouse",
            "Address": "Ketura",
            "City": "Ketura",
            "Latitude": 29.9678,
            "Longitude": 35.06,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ramat David - Gym",
            "Address": "Ramat David",
            "City": "Ramat David",
            "Latitude": 32.6797,
            "Longitude": 35.2045,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ramat David - Secretariat",
            "Address": "2 Svil HaDekel",
            "City": "Ramat David",
            "Latitude": 32.6771,
            "Longitude": 35.2035,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ramat David - Public Parking, Elderly Home",
            "Address": "Ramat David",
            "City": "Ramat David",
            "Latitude": 32.6783,
            "Longitude": 35.2019,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Lahav - Public Parking, Kolbo",
            "Address": "Lahav",
            "City": "Lahav",
            "Latitude": 31.3796,
            "Longitude": 34.869,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Lahav - Research Institute",
            "Address": "Lahav",
            "City": "Lahav",
            "Latitude": 31.3794,
            "Longitude": 34.8713,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kramim Switchboard",
            "Address": "Kramim",
            "City": "Kramim",
            "Latitude": 31.3358,
            "Longitude": 34.9185,
            "Operator": "Nofar",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Kramim Secretariat",
            "Address": "Kramim",
            "City": "Kramim",
            "Latitude": 31.3318,
            "Longitude": 34.917,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kramim Rural Lodging",
            "Address": "Kramim",
            "City": "Kramim",
            "Latitude": 31.333,
            "Longitude": 34.9167,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Migdal Oz - Central Parking",
            "Address": "Migdal Oz",
            "City": "Migdal Oz",
            "Latitude": 31.6414,
            "Longitude": 35.1425,
            "Operator": "Nofar",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Migdal Oz - Duvdevan Parking",
            "Address": "Migdal Oz",
            "City": "Migdal Oz",
            "Latitude": 31.6391,
            "Longitude": 35.1433,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Migdal Oz - Factory",
            "Address": "Ma'oz 1",
            "City": "Migdal Oz",
            "Latitude": 31.6411,
            "Longitude": 35.1409,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Mesilot - Dining Hall",
            "Address": "Mesilot",
            "City": "Mesilot",
            "Latitude": 32.496,
            "Longitude": 35.4747,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Mesilot - School",
            "Address": "Southern Entrance, Mesilot",
            "City": "Mesilot",
            "Latitude": 32.4933,
            "Longitude": 35.4726,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Galilion Test",
            "Address": "Highway 90",
            "City": "Undefined",
            "Latitude": 33.1175,
            "Longitude": 35.5733,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ma'agan Michael",
            "Address": "Ma'agan Michael  Israel",
            "City": "Ma'agan Michael",
            "Latitude": 32.5587,
            "Longitude": 34.9178,
            "Operator": "Nofar",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Centro Rehovot",
            "Address": "10 Moti Kind Street",
            "City": "Rehovot",
            "Latitude": 31.8941,
            "Longitude": 34.789,
            "Operator": "Nofar",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "V Center - AC",
            "Address": "251 HaHistadrut Avenue",
            "City": "Haifa",
            "Latitude": 32.81,
            "Longitude": 35.0682,
            "Operator": "Nofar",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "V Center - DC",
            "Address": "253 HaHistadrut Avenue",
            "City": "Haifa",
            "Latitude": 32.8105,
            "Longitude": 35.0696,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Alonei HaBashan - Tourism",
            "Address": "רמת הגולן",
            "City": "Alonei HaBashan",
            "Latitude": 33.0424,
            "Longitude": 35.8374,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Menivim Caesarea",
            "Address": "20 Alon ha-Tavor Street",
            "City": "Caesarea",
            "Latitude": 32.4748,
            "Longitude": 34.9491,
            "Operator": "Nofar",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Netzarim Educational Campus",
            "Address": "Bnei Netzarim",
            "City": "Bnei Netzarim",
            "Latitude": 31.141,
            "Longitude": 34.3187,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Galon - Tal Bar",
            "Address": "Gal On",
            "City": "Gal On",
            "Latitude": 31.6335,
            "Longitude": 34.8468,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gevim - Secretariat",
            "Address": "Gevim",
            "City": "Gevim",
            "Latitude": 31.5072,
            "Longitude": 34.6007,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Barkai - Public Parking",
            "Address": "Barkai",
            "City": "Barkai",
            "Latitude": 32.4747,
            "Longitude": 35.0273,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Or HaNer - Ornith",
            "Address": "Unnamed Road",
            "City": "Or HaNer",
            "Latitude": 31.5597,
            "Longitude": 34.6043,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Or HaNer - New Neighborhood",
            "Address": "Or HaNer",
            "City": "Or HaNer",
            "Latitude": 31.5592,
            "Longitude": 34.5964,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Parod - Animal Corner",
            "Address": "8593",
            "City": "Parod",
            "Latitude": 32.9342,
            "Longitude": 35.4325,
            "Operator": "Nofar",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ackerstein",
            "Address": "8 HaMada Street",
            "City": "Herzliya",
            "Latitude": 32.1661,
            "Longitude": 34.8133,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Or HaNer - Sports Field",
            "Address": "Or HaNer",
            "City": "Or HaNer",
            "Latitude": 31.5579,
            "Longitude": 34.6005,
            "Operator": "Nofar",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Gevim - Steam Room",
            "Address": "Gevim",
            "City": "Gevim",
            "Latitude": 31.5065,
            "Longitude": 34.5997,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gevim - Peephole",
            "Address": "Gevim",
            "City": "Gevim",
            "Latitude": 31.5075,
            "Longitude": 34.597,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gevim - Pool",
            "Address": "Gevim",
            "City": "Gevim",
            "Latitude": 31.5089,
            "Longitude": 34.5979,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gevim - Electrical Room",
            "Address": "Gevim",
            "City": "Gevim",
            "Latitude": 31.5072,
            "Longitude": 34.601,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gevim - Polg",
            "Address": "Gevim",
            "City": "Gevim",
            "Latitude": 31.506,
            "Longitude": 34.6003,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gevim - Clinic",
            "Address": "Gevim",
            "City": "Gevim",
            "Latitude": 31.5058,
            "Longitude": 34.5982,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gevim - Artichoke",
            "Address": "Gevim",
            "City": "Gevim",
            "Latitude": 31.5054,
            "Longitude": 34.5962,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Barkai - Kindergarten Parking",
            "Address": "Barkai",
            "City": "Barkai",
            "Latitude": 32.4752,
            "Longitude": 35.0311,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Merhavia - Eastern Pool",
            "Address": "Merhavia (Kibbuts)",
            "City": "Merhavia (Kibbuts)",
            "Latitude": 32.6029,
            "Longitude": 35.309,
            "Operator": "Nofar",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Merhavia - Switchboard B",
            "Address": "Merhavia (Kibbuts)",
            "City": "Merhavia (Kibbuts)",
            "Latitude": 32.6021,
            "Longitude": 35.3067,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Galon - Southern Neighborhood Public Parking",
            "Address": "Gal On",
            "City": "Gal On",
            "Latitude": 31.6314,
            "Longitude": 34.8465,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Amir",
            "Address": "Amir",
            "City": "Amir",
            "Latitude": 33.1786,
            "Longitude": 35.6213,
            "Operator": "Nofar",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Beit Guvrin",
            "Address": "Beit Guvrin",
            "City": "Beit Guvrin",
            "Latitude": 31.6129,
            "Longitude": 34.8954,
            "Operator": "Nofar",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Tel Yitzhak",
            "Address": "1 Simtat HaKodchim",
            "City": "Tel Itshak",
            "Latitude": 32.2532,
            "Longitude": 34.8678,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sde Eliyahu",
            "Address": "Sde Eliyahu",
            "City": "Sde Eliyahu",
            "Latitude": 32.4419,
            "Longitude": 35.5138,
            "Operator": "Nofar",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Mishmarot",
            "Address": "Mishmarot",
            "City": "Mishmarot",
            "Latitude": 32.4857,
            "Longitude": 34.9819,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sa'ad - Secretariat",
            "Address": "Sa'ad",
            "City": "Sa'ad",
            "Latitude": 31.4708,
            "Longitude": 34.5345,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sa'ad - Electrical Switchboard",
            "Address": "Sa'ad",
            "City": "Sa'ad",
            "Latitude": 31.4702,
            "Longitude": 34.5344,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Or HaNer (DC) - Sports Field",
            "Address": "HJ52+55Q Or HaNer  Israel",
            "City": "Or HaNer",
            "Latitude": 31.558,
            "Longitude": 34.6005,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Menivim Kfar Saba",
            "Address": "1 HaTahana Street",
            "City": "Kefar Sava",
            "Latitude": 32.1736,
            "Longitude": 34.8914,
            "Operator": "Nofar",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Token Test",
            "Address": "Ha-Saifan St 9  Ein Vered  Israel",
            "City": "Ein Vered",
            "Latitude": 32.2703,
            "Longitude": 34.9325,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Menivim - Bnei Brak",
            "Address": "Aharonovich Street",
            "City": "Bnei Brak",
            "Latitude": 32.0923,
            "Longitude": 34.8391,
            "Operator": "Nofar",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Neot Golan - Grocery",
            "Address": "Ne'ot Golan",
            "City": "Ne'ot Golan",
            "Latitude": 32.7872,
            "Longitude": 35.6944,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Neot Golan - Kindergarten Public Parking",
            "Address": "Ne'ot Golan",
            "City": "Ne'ot Golan",
            "Latitude": 32.7858,
            "Longitude": 35.6928,
            "Operator": "Nofar",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Omanot Habarzel Umm al-Fahm",
            "Address": "Alnakheel - Iron Art",
            "City": "Kfar Kasem ",
            "Latitude": 32.5309594,
            "Longitude": 35.1644054,
            "Operator": "TDSD",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "MAXPOWER - TEST",
            "Address": "China",
            "City": "China",
            "Latitude": 32.0132751,
            "Longitude": 34.81024503,
            "Operator": "TDSD",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Hamerkava 25 DC",
            "Address": "Hamerkava 25 ",
            "City": "Holon",
            "Latitude": 32.0132797,
            "Longitude": 34.81028258,
            "Operator": "TDSD",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Omanot Habarzel Umm al-Fahm",
            "Address": "Alnakheel - Iron Art",
            "City": "Om el Phahem",
            "Latitude": 32.5309594,
            "Longitude": 35.1644054,
            "Operator": "TDSD",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Hamerkava 25 Holon DC TDSD",
            "Address": "Hamerkava 25 Holon - TDSD ",
            "City": "Holon ",
            "Latitude": 32.0135914,
            "Longitude": 34.81019953,
            "Operator": "TDSD",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Hamerkava 25 Holon",
            "Address": "Hamerkava 25 Holon",
            "City": "Holon",
            "Latitude": 32.0131319,
            "Longitude": 34.81017628,
            "Operator": "TDSD",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Susya",
            "Address": " ",
            "City": "Susya",
            "Latitude": 31.390388,
            "Longitude": 35.118328,
            "Operator": "Lishatech",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Soho Complex - AC",
            "Address": "Mefi Street 5",
            "City": "Netanya",
            "Latitude": 32.275029,
            "Longitude": 34.861588,
            "Operator": "Lishatech",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Ashkelon Marina",
            "Address": "Bat Galim Street 5",
            "City": "Ashkelon",
            "Latitude": 31.683286,
            "Longitude": 34.556636,
            "Operator": "Lishatech",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Grand Hotel, Dead Sea",
            "Address": " ",
            "City": "Ein Bokek",
            "Latitude": 31.202563,
            "Longitude": 35.361438,
            "Operator": "Lishatech",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Jerusalem Hotel",
            "Address": "Saint George Street 15",
            "City": "Jerusalem",
            "Latitude": 31.789098,
            "Longitude": 35.227889,
            "Operator": "Lishatech",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Kibbutz Revadim",
            "Address": "Revadim",
            "City": "Revadim",
            "Latitude": 31.772626,
            "Longitude": 34.813907,
            "Operator": "Lishatech",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ashkelon Marina - DC",
            "Address": "Bat Galim Street 5",
            "City": "Ashkelon",
            "Latitude": 31.683286,
            "Longitude": 34.556636,
            "Operator": "Lishatech",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ofer Energy",
            "Address": "HaShomron 65",
            "City": "Even Yehuda",
            "Latitude": 32.264492,
            "Longitude": 34.876642,
            "Operator": "Lishatech",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "LishaTek Office",
            "Address": "Roma Street 15",
            "City": "Sderot",
            "Latitude": 31.519713,
            "Longitude": 34.601998,
            "Operator": "Lishatech",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Pane Hever",
            "Address": " ",
            "City": NaN,
            "Latitude": 31.485188,
            "Longitude": 35.165438,
            "Operator": "Lishatech",
            "Duplicate Count": NaN
        },
        {
            "Station Name": "Soho Complex - DC",
            "Address": "Mefi Street 5",
            "City": "Netanya",
            "Latitude": 32.275029,
            "Longitude": 34.861588,
            "Operator": "Lishatech",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Tobol, Hazor HaGalilit",
            "Address": "HaAshhar Street ",
            "City": "Hatzor HaGlilit",
            "Latitude": 32.986825,
            "Longitude": 35.545675,
            "Operator": "Lishatech",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Arad Religious Girls' High School",
            "Address": " ",
            "City": "Arad",
            "Latitude": 31.255062,
            "Longitude": 35.216688,
            "Operator": "Lishatech",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Dimona - Camel Farm",
            "Address": " ",
            "City": "Dimona",
            "Latitude": 31.029813,
            "Longitude": 35.077688,
            "Operator": "Lishatech",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Intergamma - Kfar Netter",
            "Address": "Meir Ariel 6",
            "City": "Netanya",
            "Latitude": 32.28482,
            "Longitude": 34.872073,
            "Operator": "Lishatech",
            "Duplicate Count": 14.0
        },
        {
            "Station Name": "National Library of Israel",
            "Address": "Eliezer Kaplan 1",
            "City": "Jerusalem",
            "Latitude": 31.777783,
            "Longitude": 35.202574,
            "Operator": "Lishatech",
            "Duplicate Count": 11.0
        },
        {
            "Station Name": "Biankini Beach, Dead Sea",
            "Address": " ",
            "City": "Dead Sea",
            "Latitude": 31.761088,
            "Longitude": 35.50098,
            "Operator": "Lishatech",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Moza",
            "Address": "Revadim",
            "City": "Revadim",
            "Latitude": 31.772626,
            "Longitude": 34.813907,
            "Operator": "Lishatech",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Shelter",
            "Address": "Revadim",
            "City": "Revadim",
            "Latitude": 31.772626,
            "Longitude": 34.813907,
            "Operator": "Lishatech",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Hilton",
            "Address": "HaYarkon 205",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.087517,
            "Longitude": 34.7712742,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Paz Lido Junction",
            "Address": " ",
            "City": "Power Center",
            "Latitude": 33.124409,
            "Longitude": 35.569616,
            "Operator": "Gnrgy",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Paula Cafe",
            "Address": " ",
            "City": "Sde Boker",
            "Latitude": 30.874175,
            "Longitude": 34.789272,
            "Operator": "Gnrgy",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Zim Center Mall, Ma'alot",
            "Address": "Shlomo Shirira 3",
            "City": "Ma'alot",
            "Latitude": 33.021167,
            "Longitude": 35.280394,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Harel Mall",
            "Address": "Harel 1",
            "City": "Mevaseret Zion",
            "Latitude": 31.799815,
            "Longitude": 35.14903,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Zim Urban Netivot",
            "Address": "Ba'alei HaMelacha 5",
            "City": "Netivot",
            "Latitude": 31.417158,
            "Longitude": 34.593853,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Koshi Rimon Inn - Mile Marker 101",
            "Address": "The 101st Kilometer",
            "City": "Arava Road",
            "Latitude": 30.306744,
            "Longitude": 35.134586,
            "Operator": "Gnrgy",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Assuta Medical Centers Ltd.",
            "Address": "HaBarzel 20",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.1082115,
            "Longitude": 34.8385786,
            "Operator": "Gnrgy",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Inbar Hotel",
            "Address": "Yehuda 38",
            "City": "Arad",
            "Latitude": 31.2558792,
            "Longitude": 35.2102055,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Israel Museum",
            "Address": "Ruppin 11",
            "City": "Jerusalem",
            "Latitude": 31.774021,
            "Longitude": 35.204371,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Lubinski, Be'er Sheva",
            "Address": "Tozeret HaAretz 1",
            "City": "Be'er Sheva",
            "Latitude": 31.22004,
            "Longitude": 34.803678,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Weizmann Institute",
            "Address": "Herzl 234",
            "City": "Rehovot",
            "Latitude": 31.903756,
            "Longitude": 34.808032,
            "Operator": "Gnrgy",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Millennium House - Ra'anana",
            "Address": "HaTidhar 2",
            "City": "Ra'anana",
            "Latitude": 32.192318,
            "Longitude": 34.884632,
            "Operator": "Gnrgy",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Toha Tower",
            "Address": "Tozeret HaAretz 8",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.07279,
            "Longitude": 34.79501,
            "Operator": "Gnrgy",
            "Duplicate Count": 30.0
        },
        {
            "Station Name": "Lubinski Showroom, Jerusalem",
            "Address": "Yad Harutzim 9",
            "City": "Jerusalem",
            "Latitude": 31.75252102,
            "Longitude": 35.2166712,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "NVIDIA (Authorized Users Only)",
            "Address": "Industrial Park 1",
            "City": "Tel Hai",
            "Latitude": 33.2364294,
            "Longitude": 35.5825324,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "NVIDIA (Authorized Users Only)",
            "Address": "HaBarzel 6",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.10707861,
            "Longitude": 34.83664173,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "NVIDIA (Authorized Users Only)",
            "Address": "Zarchin Alexander 13",
            "City": "Ra'anana",
            "Latitude": 32.19801556,
            "Longitude": 34.88235827,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "NVIDIA (Authorized Users Only)",
            "Address": "HaKidma 26",
            "City": "Yokneam Illit",
            "Latitude": 32.6658783,
            "Longitude": 35.10460663,
            "Operator": "Gnrgy",
            "Duplicate Count": 12.0
        },
        {
            "Station Name": "NVIDIA (Authorized Users Only)",
            "Address": "HaKidma",
            "City": "Yokneam Illit",
            "Latitude": 32.66646565,
            "Longitude": 35.10663721,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Six Senses",
            "Address": " ",
            "City": "Shaharut",
            "Latitude": 29.9160138,
            "Longitude": 35.0053777,
            "Operator": "Gnrgy",
            "Duplicate Count": 10.0
        },
        {
            "Station Name": "NVIDIA (Authorized Users Only)",
            "Address": "Mevo Sivan 1",
            "City": "Kiryat Gat",
            "Latitude": 31.60544095,
            "Longitude": 34.78361138,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ofer Center, Nof HaGalil",
            "Address": "Derech Ariel Sharon 41",
            "City": "Nof HaGalil",
            "Latitude": 32.69389523,
            "Longitude": 35.30360882,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Zim Center Complex, Arad",
            "Address": "HaTa'asiya 60",
            "City": "Arad",
            "Latitude": 31.247797,
            "Longitude": 35.1999023,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Zim Center, Beit She'an",
            "Address": "HaAmal 7",
            "City": "Beit She'an",
            "Latitude": 32.5103102,
            "Longitude": 35.502033,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sha'ar HaIr Mall",
            "Address": "Yigal Alon 1",
            "City": "Beit Shemesh",
            "Latitude": 31.75582643,
            "Longitude": 34.98798844,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Carasso Center, Even Yehuda",
            "Address": "HaMeyasdim 62",
            "City": "Even Yehuda",
            "Latitude": 32.2698768,
            "Longitude": 34.8886212,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Barzilai University Medical Center",
            "Address": "HaHistadrut 2",
            "City": "Ashkelon",
            "Latitude": 31.66234249,
            "Longitude": 34.55931051,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Negev Vehicle Center",
            "Address": "Herzl Street",
            "City": "Kiryat Ekron",
            "Latitude": 31.8788966,
            "Longitude": 34.8198954,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Hutzot Shefayim",
            "Address": " ",
            "City": "Shfayim",
            "Latitude": 32.221837,
            "Longitude": 34.828185,
            "Operator": "Gnrgy",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Mikdan Parking Lot, Public Charging Station",
            "Address": "Derech HaShalom 53",
            "City": "Giv'atayim",
            "Latitude": 32.067204,
            "Longitude": 34.803418,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "HaGoshrim",
            "Address": "HaShomer HaChadash 1",
            "City": "Kibbutz HaGoshrim",
            "Latitude": 33.22125172,
            "Longitude": 35.62292575,
            "Operator": "Gnrgy",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Bank Hapoalim (For Bank Employees and Guests Only)",
            "Address": "Yehuda HaLevi 63",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.06350165,
            "Longitude": 34.77616023,
            "Operator": "Gnrgy",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "The Merton House - Entry and Charging for Authorized Users Only",
            "Address": "Aharon Bart 18",
            "City": "Petah Tikva",
            "Latitude": 32.10154453,
            "Longitude": 34.86131174,
            "Operator": "Gnrgy",
            "Duplicate Count": 27.0
        },
        {
            "Station Name": "Harduf",
            "Address": "Harduf 1",
            "City": "Kibbutz Harduf",
            "Latitude": 32.76386467,
            "Longitude": 35.172925,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Track Gas Station",
            "Address": "Highway 98",
            "City": "Majdal Shams",
            "Latitude": 33.2657064,
            "Longitude": 35.7705187,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gnrgy ES Office",
            "Address": "Carrer de Joan Güell 47",
            "City": "Barcelona",
            "Latitude": 41.37811543,
            "Longitude": 2.13351919,
            "Operator": "Gnrgy",
            "Duplicate Count": 7.0
        },
        {
            "Station Name": "Ofer Park, Petah Tikva",
            "Address": "Derech Shlomo Shmeltzer 94",
            "City": "Petah Tikva",
            "Latitude": 32.1012,
            "Longitude": 34.8498,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Rasko",
            "Address": "HaBarzel",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.10709933,
            "Longitude": 34.83645848,
            "Operator": "Gnrgy",
            "Duplicate Count": 10.0
        },
        {
            "Station Name": "Mizrahi Bank, Lod (For Bank Employees Only)",
            "Address": "Abba Hillel Silver 13",
            "City": "Lod",
            "Latitude": 31.9599204,
            "Longitude": 34.9011126,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kibbutz Menachem (For Members Only)",
            "Address": "Menachem 1",
            "City": "Kfar",
            "Latitude": 31.729733,
            "Longitude": 34.8388614,
            "Operator": "Gnrgy",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Kibbutz Tel Katzir",
            "Address": "Katzir 0",
            "City": "Tel",
            "Latitude": 32.705753,
            "Longitude": 35.6193169,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "East - Ofer Park",
            "Address": "HaPsagot 9",
            "City": "Petah Tikva",
            "Latitude": 32.09999,
            "Longitude": 34.85413,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Intel Public (For Intel Employees Only)",
            "Address": "Intel Building 9",
            "City": "Haifa",
            "Latitude": 32.79105233,
            "Longitude": 34.96132413,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gnrgy IN Warehouse",
            "Address": "Gnrgy IN Warehouse",
            "City": "Gnrgy IN Warehouse",
            "Latitude": 12.92426453,
            "Longitude": 77.65152363,
            "Operator": "Gnrgy",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Lido Junction",
            "Address": "Lido 1",
            "City": "Kibbutz Beit HaArava",
            "Latitude": 31.77384441,
            "Longitude": 35.50422175,
            "Operator": "Gnrgy",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Zim Mall, Yarka",
            "Address": "Seven Complex, Yarka",
            "City": "Yarka",
            "Latitude": 32.956008,
            "Longitude": 35.181304,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Lev Mall, Hadera",
            "Address": "Rothschild Boulevard 40",
            "City": "Hadera",
            "Latitude": 32.4378986,
            "Longitude": 34.9245742,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Shefayim Hotel / Water Park",
            "Address": "60990",
            "City": "Shfayim",
            "Latitude": 32.2149764,
            "Longitude": 34.822782,
            "Operator": "Gnrgy",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ganei Tikva - Givat Savion",
            "Address": "HaGalil 78",
            "City": "Ganei Tikva",
            "Latitude": 32.05714392,
            "Longitude": 34.86887,
            "Operator": "Gnrgy",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Frisbee Hadera",
            "Address": "Adani Street 38",
            "City": "Hadera",
            "Latitude": 32.437028,
            "Longitude": 34.919342,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Eshel Prison",
            "Address": "P.O. Box 59",
            "City": "Be'er Sheva",
            "Latitude": 31.20706,
            "Longitude": 34.8107,
            "Operator": "Gnrgy",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Yochananof, Ma'ale Adumim",
            "Address": "Haruvit 38",
            "City": "Ma'ale Adumim",
            "Latitude": 31.78794,
            "Longitude": 35.33782,
            "Operator": "Gnrgy",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Sha'arei Avraham Training Center",
            "Address": "Sha'arei Avraham Junction",
            "City": "Bnei Re'em",
            "Latitude": 31.76265,
            "Longitude": 34.79436,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Frisbee - Sorek Park",
            "Address": "HaYozma 1",
            "City": "Rishon Lezion",
            "Latitude": 31.95237,
            "Longitude": 34.770842,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Israel Prison Service",
            "Address": "Rabbi Shimon Yitzhak Afriat 1",
            "City": "Ramla",
            "Latitude": 31.94167,
            "Longitude": 34.87416,
            "Operator": "Gnrgy",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Channel 12 News (For Employees and Guests Only)",
            "Address": "Neve Ilan 1",
            "City": "Neve Ilan",
            "Latitude": 31.8083228,
            "Longitude": 35.08087905,
            "Operator": "Gnrgy",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Eco Tower (For Guests)",
            "Address": "HaMasger 34",
            "City": "Tel Aviv",
            "Latitude": 32.06434575,
            "Longitude": 34.78593046,
            "Operator": "Gnrgy",
            "Duplicate Count": 14.0
        },
        {
            "Station Name": "Ella Prison",
            "Address": "P.O. Box 59",
            "City": "Be'er Sheva",
            "Latitude": 31.204,
            "Longitude": 34.8093,
            "Operator": "Gnrgy",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Cello QA-1",
            "Address": "26 HaRokmim Street",
            "City": "Holon",
            "Latitude": 32.0076184,
            "Longitude": 34.80000547,
            "Operator": "CelloSIM",
            "Duplicate Count": 28.0
        },
        {
            "Station Name": "Alfei Menashe",
            "Address": "Karkom 4",
            "City": "Alfei Menashe",
            "Latitude": 32.1726521,
            "Longitude": 35.0159762,
            "Operator": "InterEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Rubinstein House",
            "Address": "Lincoln 20",
            "City": "Tel Aviv",
            "Latitude": 32.0658042,
            "Longitude": 34.7829381,
            "Operator": "InterEv",
            "Duplicate Count": 10.0
        },
        {
            "Station Name": "Beit El - Bitan",
            "Address": "Ma’agalei HaRe’iya 15",
            "City": "House",
            "Latitude": 31.9438,
            "Longitude": 35.22126,
            "Operator": "InterEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Agamim BS",
            "Address": "Kishon Street 32",
            "City": "Be'er Sheva",
            "Latitude": 31.2247247,
            "Longitude": 34.8188711,
            "Operator": "InterEv",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Lara Events",
            "Address": "Yerok 20",
            "City": "Kannot",
            "Latitude": 31.79726037,
            "Longitude": 34.75792877,
            "Operator": "InterEv",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Troya Events",
            "Address": "Bnei Darom Complex",
            "City": "Ashdod",
            "Latitude": 31.822916,
            "Longitude": 34.69944568,
            "Operator": "InterEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ein Kshatot - Hacal Golan",
            "Address": "Heritage Site",
            "City": "Ein Kshatot",
            "Latitude": 32.848858,
            "Longitude": 35.739766,
            "Operator": "InterEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Znobar - Hacal Golan",
            "Address": "Tsnobar",
            "City": "Golan Heights",
            "Latitude": 33.0135916,
            "Longitude": 35.6881938,
            "Operator": "InterEv",
            "Duplicate Count": 10.0
        },
        {
            "Station Name": "Bnei Yehuda - Hacal Golan",
            "Address": "Industrial Zone",
            "City": "Bnei Yehuda",
            "Latitude": 32.80340696,
            "Longitude": 35.71849471,
            "Operator": "InterEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Charging Area 1",
            "Address": "Cesta Osvobodilne Fronte 42",
            "City": "Maribor",
            "Latitude": 46.5495266,
            "Longitude": 15.6682176,
            "Operator": "EvTech",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Ya'akobi Complex, Modi'in",
            "Address": "Dam HaMaccabim 28",
            "City": "Modi'in",
            "Latitude": 31.9061025,
            "Longitude": 35.005832,
            "Operator": "EvTech",
            "Duplicate Count": 24.0
        },
        {
            "Station Name": "1920 - Shlomi",
            "Address": "Shoshanat HaAmakim 34, Apartment B",
            "City": "Kadima Zoran",
            "Latitude": 32.294385,
            "Longitude": 34.9379738,
            "Operator": "EvTech",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Test Charge",
            "Address": "Derech HaMaccabim 40",
            "City": "Rishon Lezion",
            "Latitude": 31.979988,
            "Longitude": 34.8094699,
            "Operator": "EvTech",
            "Duplicate Count": 19.0
        },
        {
            "Station Name": "Ma'ale Adumim 139-140",
            "Address": "Di Zahav 7",
            "City": "Ma'ale Adumim",
            "Latitude": 31.7870683,
            "Longitude": 35.337119,
            "Operator": "EvTech",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ma'ale Adumim 137-138",
            "Address": "Di Zahav 7",
            "City": "Ma'ale Adumim",
            "Latitude": 31.7870683,
            "Longitude": 35.337119,
            "Operator": "EvTech",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ma'ale Adumim 135-136",
            "Address": "Di Zahav 7",
            "City": "Ma'ale Adumim",
            "Latitude": 31.7870683,
            "Longitude": 35.337119,
            "Operator": "EvTech",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ma'ale Adumim 129-130",
            "Address": "Di Zahav 7",
            "City": "Ma'ale Adumim",
            "Latitude": 31.7870683,
            "Longitude": 35.337119,
            "Operator": "EvTech",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ma'ale Adumim 127-128",
            "Address": "Di Zahav 7",
            "City": "Ma'ale Adumim",
            "Latitude": 31.7870683,
            "Longitude": 35.337119,
            "Operator": "EvTech",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ma'ale Adumim 125-126",
            "Address": "Di Zahav 7",
            "City": "Ma'ale Adumim",
            "Latitude": 31.7870683,
            "Longitude": 35.337119,
            "Operator": "EvTech",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ma'ale Adumim 123-124",
            "Address": "Di Zahav 7",
            "City": "Ma'ale Adumim",
            "Latitude": 31.7870683,
            "Longitude": 35.337119,
            "Operator": "EvTech",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ma'ale Adumim 133-134",
            "Address": "Di Zahav 7",
            "City": "Ma'ale Adumim",
            "Latitude": 31.7870683,
            "Longitude": 35.337119,
            "Operator": "EvTech",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ma'ale Adumim 131-132",
            "Address": "Di Zahav 7",
            "City": "Ma'ale Adumim",
            "Latitude": 31.7870683,
            "Longitude": 35.337119,
            "Operator": "EvTech",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ma'ale Adumim 122-121",
            "Address": "Di Zahav 7",
            "City": "Ma'ale Adumim",
            "Latitude": 31.7870683,
            "Longitude": 35.337119,
            "Operator": "EvTech",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Scala office",
            "Address": "Harimon St 86  Neve Yamin  Israel",
            "City": "Neve Yamin",
            "Latitude": 32.169665,
            "Longitude": 34.933477,
            "Operator": "ScalaEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Kibbutz Maale Hahamisha",
            "Address": "Ma'ale HaHamisha  Israel",
            "City": "Ma'ale HaHamisha",
            "Latitude": 31.817057,
            "Longitude": 35.111837,
            "Operator": "ScalaEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Control Pro",
            "Address": "Ha-Melakha 25  Netanya  Israel",
            "City": "Netanya",
            "Latitude": 32.280871,
            "Longitude": 34.859575,
            "Operator": "ScalaEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Amirey Hagalil Spa Hotel",
            "Address": "Amirim  Israel",
            "City": "Amirim",
            "Latitude": 32.936931,
            "Longitude": 35.438828,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Nof Ginosar Hotel",
            "Address": "Ginosar  1498000  Israel",
            "City": "Ginosar",
            "Latitude": 32.844376,
            "Longitude": 35.523118,
            "Operator": "ScalaEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Mitzpeh Kinneret 10  Amirim",
            "Address": "Mitzpeh Kinneret St 10  Amirim  Israel",
            "City": "Amirim",
            "Latitude": 32.939577,
            "Longitude": 35.44384,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ohn-bar guesthouse",
            "Address": "Hahoresh St 14  Amirim  Israel",
            "City": "Amirim",
            "Latitude": 32.940804,
            "Longitude": 35.443591,
            "Operator": "ScalaEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Trumpeldor 31  Kiryat Shmona",
            "Address": "Joseph Trumpeldor St 31  Qiryat Shemona  Isra",
            "City": "Qiryat Shemona",
            "Latitude": 33.205438,
            "Longitude": 35.570713,
            "Operator": "ScalaEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Tzifha International",
            "Address": "Sderot Yechezkel 2  Modiin Ilit  Israel",
            "City": "Modi'in Ilit",
            "Latitude": 31.936938,
            "Longitude": 35.039031,
            "Operator": "ScalaEv",
            "Duplicate Count": 10.0
        },
        {
            "Station Name": "Moriah Ave",
            "Address": "Moriah Ave 40  Haifa  Israel",
            "City": "Haifa",
            "Latitude": 32.798407,
            "Longitude": 34.984409,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Shaked Center",
            "Address": "HaRav Ovadia Yosef St 10  Ofakim",
            "City": "Ofakim",
            "Latitude": 31.300945,
            "Longitude": 34.619395,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Doral Urban Energy (LTD)",
            "Address": "Shenkar 3  Herzelia   Israel",
            "City": "Herzelia",
            "Latitude": 32.160244,
            "Longitude": 34.809579,
            "Operator": "ScalaEv",
            "Duplicate Count": 12.0
        },
        {
            "Station Name": "Givat Haim ihud - Swimming pool",
            "Address": "Givat Haim ihud  Israel",
            "City": "Givat Haim",
            "Latitude": 32.401207,
            "Longitude": 34.935755,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Givat Haim ihud - Wien House",
            "Address": "Givat Haim ihud  Israel",
            "City": "Givat Haim",
            "Latitude": 32.397926,
            "Longitude": 34.933125,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sofia Hotel",
            "Address": "HaPalmach St 12  Tiberias  Israel",
            "City": "Tiberias",
            "Latitude": 32.79164,
            "Longitude": 35.539893,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Givat Haim ihud - Lev hapardes",
            "Address": "Givat Haim ihud  Israel",
            "City": "Givat Haim",
            "Latitude": 32.396115,
            "Longitude": 34.935689,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ramat Yohanan",
            "Address": "Ramat Yohanan  Israel",
            "City": "Ramat Yohanan",
            "Latitude": 32.793296,
            "Longitude": 35.124533,
            "Operator": "ScalaEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Assuta Ramat HaHayal",
            "Address": "HaBarzel St 20  Tel Aviv-Yafo  Israel",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.107902,
            "Longitude": 34.83937,
            "Operator": "ScalaEv",
            "Duplicate Count": 10.0
        },
        {
            "Station Name": "Allied Building",
            "Address": "Bar Kochva St 25  Bnei Brak  Israel",
            "City": "Bnei Brak",
            "Latitude": 32.094844,
            "Longitude": 34.822885,
            "Operator": "ScalaEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Kfar Hahoresh",
            "Address": "Kfar HaHoresh  Israel",
            "City": "Kfar HaHoresh",
            "Latitude": 32.701375,
            "Longitude": 35.27357,
            "Operator": "ScalaEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Link Shahav",
            "Address": "Derech Begin 26  Tirat Carmel  Israel",
            "City": "Tirat Carmel",
            "Latitude": 32.750057,
            "Longitude": 34.967879,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gan Shmuel - Shopping Center",
            "Address": "Gan Shmuel  Israel",
            "City": "Gan Shmuel",
            "Latitude": 32.447673,
            "Longitude": 34.954212,
            "Operator": "ScalaEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Amal 12  Park Afek",
            "Address": "Amal St 12  Rosh Haayin  Israel",
            "City": "Rosh Haayin",
            "Latitude": 32.106667,
            "Longitude": 34.967535,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Amal 1  Park Afek",
            "Address": "Amal St 1  Rosh Haayin  Israel",
            "City": "Rosh HaAyin",
            "Latitude": 32.108667,
            "Longitude": 34.965137,
            "Operator": "ScalaEv",
            "Duplicate Count": 10.0
        },
        {
            "Station Name": "Yitzhak Nafha 25",
            "Address": "Yitzhak Nafha 25  Be'er Sheva  Israel",
            "City": "Be'er Sheva",
            "Latitude": 31.246926,
            "Longitude": 34.812161,
            "Operator": "ScalaEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Kfar Giladi",
            "Address": "Kibbutz Kfar Giladi  Israel",
            "City": "Kfar Giladi",
            "Latitude": 33.243487,
            "Longitude": 35.574833,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Globus Center - Ashkelon",
            "Address": "Ashkelon Beach, Mavki'im Junction",
            "City": "Mavki'im",
            "Latitude": 31.626498,
            "Longitude": 34.583037,
            "Operator": "ScalaEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Shaul HaMelech Mall",
            "Address": "Sha'ul HaMelech St 80 ",
            "City": "Be'er Sheva",
            "Latitude": 31.257366,
            "Longitude": 34.767843,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kadarim",
            "Address": "Kadarim  Israel",
            "City": "Kadarim",
            "Latitude": 32.898886,
            "Longitude": 35.471565,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Jabotinski  1 - Ofakim",
            "Address": "Jabotinski St 1  ",
            "City": "Ofakim",
            "Latitude": 31.31831,
            "Longitude": 34.620699,
            "Operator": "ScalaEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Mivne Parking - Igal Alon",
            "Address": "Yosef Boxenbaum ",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.065635,
            "Longitude": 34.793226,
            "Operator": "ScalaEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Hamaspenot Champion Garage",
            "Address": "Yulius Simon St 52  Haifa  Israel",
            "City": "Haifa",
            "Latitude": 32.816817,
            "Longitude": 35.043846,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "The Young Towers - Tel Aviv",
            "Address": "Derech Menachem Begin 158  Tel Aviv-Jaffa  Is",
            "City": "Tel Aviv-Jaffa",
            "Latitude": 32.080022,
            "Longitude": 34.79563,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ramat Yohanan - Stadium",
            "Address": "Ramat Yohanan  Israel",
            "City": "Ramat Yohanan",
            "Latitude": 32.794696,
            "Longitude": 35.119766,
            "Operator": "ScalaEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ramat Yohanan - Deker",
            "Address": "Ramat Yohanan  Israel",
            "City": "Ramat Yohanan",
            "Latitude": 32.795873,
            "Longitude": 35.121848,
            "Operator": "ScalaEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Shap House",
            "Address": "Tuval St 19  Ramat Gan  Israel",
            "City": "Ramat Gan",
            "Latitude": 32.084572,
            "Longitude": 34.802134,
            "Operator": "ScalaEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "מלון רמת רחל",
            "Address": "Kibbutz Ramat Rachel  Jerusalem  Israel",
            "City": "Jerusalem",
            "Latitude": 31.737621,
            "Longitude": 35.219341,
            "Operator": "ScalaEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ali Mall",
            "Address": "Carmel 1  Daliyat al-Karmel  30056  Israel",
            "City": "Daliyat al-Karmel",
            "Latitude": 32.699097,
            "Longitude": 35.057302,
            "Operator": "ScalaEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Mivne Natzrat Eilit",
            "Address": "Hamelacha 2 Natzrat Eilit  Israel",
            "City": "Natzrat Eilit",
            "Latitude": 32.700508,
            "Longitude": 35.314697,
            "Operator": "ScalaEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Givat Haim Ihud - Hot Spot",
            "Address": "Givat Haim ihud  Israel",
            "City": "Center District",
            "Latitude": 32.399125,
            "Longitude": 34.929527,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kochav Yokneam business center",
            "Address": "Ha-Tamar St 1  Yokne'am Illit  Israel",
            "City": "North District",
            "Latitude": 32.662569,
            "Longitude": 35.105113,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ackerstein Towers - Herzliya",
            "Address": "Ha-Menofim St 11  Herzliya  Israel",
            "City": "Tel Aviv District",
            "Latitude": 32.160276,
            "Longitude": 34.808008,
            "Operator": "ScalaEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Mivne - Tozeret Haaretz",
            "Address": "Tozeret Haaretz 7  Tel Aviv  Israel",
            "City": "Tel Aviv District",
            "Latitude": 32.073273,
            "Longitude": 34.797006,
            "Operator": "ScalaEv",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Rishpon",
            "Address": "HaKfar 2  Rishpon  Israel",
            "City": "Center District",
            "Latitude": 32.201468,
            "Longitude": 34.820055,
            "Operator": "ScalaEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Rclub Ramat Rachel",
            "Address": "Ramat Rachel Hotel  Jerusalem  Israel",
            "City": "Jerusalem",
            "Latitude": 31.738008,
            "Longitude": 35.218172,
            "Operator": "ScalaEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Mivne Shopping Center - Afula",
            "Address": "Kehilat Tsiyon St 26  Afula  Israel",
            "City": "Afula",
            "Latitude": 32.605739,
            "Longitude": 35.297023,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Yitzhak Nafha - 25",
            "Address": "Yitzhak Nafha 25  Be'er Sheva  Israel",
            "City": "Be'er Sheva",
            "Latitude": 31.245576,
            "Longitude": 34.81184,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Piano Center - South",
            "Address": "Shoshana Damari St 10  Netanya  Israel",
            "City": "Center District",
            "Latitude": 32.277692,
            "Longitude": 34.841963,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Beit Mai Parking - Haifa",
            "Address": "Hassan Shuqri 5  Haifa  Israel",
            "City": "Haifa District",
            "Latitude": 32.814305,
            "Longitude": 34.998055,
            "Operator": "ScalaEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Bar Ilan - Economy Parking",
            "Address": "Jabotinsky St 512  Ramat Gan  Israel",
            "City": "Ramat Gan",
            "Latitude": 32.072722,
            "Longitude": 34.850513,
            "Operator": "ScalaEv",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "TEN Eilat - HaSolelim 9",
            "Address": "Ha-Solelim St 9  Eilat  Israel",
            "City": "South District",
            "Latitude": 29.595874,
            "Longitude": 34.974647,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "TEN Ashkelon - HaMetakhnen 10",
            "Address": "Ha-Metakhnen St 10  Ashkelon  Israel",
            "City": "South District",
            "Latitude": 31.635131,
            "Longitude": 34.553519,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "TEN Beit Shean - North industrial park",
            "Address": "North industrial park  Beit Shean  Israel",
            "City": "Beit Shean",
            "Latitude": 32.511145,
            "Longitude": 35.500267,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "TEN Dimona - Topaz Industrial park",
            "Address": "Peretz Center/Road 25  Dimona  Israel",
            "City": "Dimona",
            "Latitude": 31.061477,
            "Longitude": 35.01981,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "TEN Kfar Saba - Atir Yeda 6",
            "Address": "Atir Yeda St 6  Kefar Sava  Israel",
            "City": "Center District",
            "Latitude": 32.164323,
            "Longitude": 34.929106,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "TEN Nesher - Tel Hanan shopping center",
            "Address": "Tel Hanan shoppping center  Nesher  Israel",
            "City": "Haifa District",
            "Latitude": 32.777664,
            "Longitude": 35.039791,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "TEN Ashdod - HaMada 1",
            "Address": "HaMada St 1  Ashdod  Israel",
            "City": "Ashdod",
            "Latitude": 31.830406,
            "Longitude": 34.670515,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "TEN Pardes Hanna - HaMelacha 92",
            "Address": "Hamelacha 92  Pardes Hana-Karkur  Israel",
            "City": "Pardes Hana-Karkur",
            "Latitude": 32.486357,
            "Longitude": 34.972159,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "TEN Rishon LeTsiyon - Ze'ev Shlang 5",
            "Address": "Ze'ev Shlang 5 Rishon LeTsiyon  Israel",
            "City": "Rishon LeTsiyon",
            "Latitude": 31.986642,
            "Longitude": 34.768819,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Mivne Shopping Center - Holon",
            "Address": "HaPeled St 7  Holon  Israel",
            "City": "Holon",
            "Latitude": 32.022507,
            "Longitude": 34.798114,
            "Operator": "ScalaEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Nir David - Laundry",
            "Address": "Nir David  Israel",
            "City": "North District",
            "Latitude": 32.506612,
            "Longitude": 35.456425,
            "Operator": "ScalaEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Nir David - Movement World",
            "Address": "Nir David  Israel",
            "City": "North District",
            "Latitude": 32.505952,
            "Longitude": 35.45753,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Silos & Cars",
            "Address": "Lekhi St 18  Ramat Gan  Israel",
            "City": "Tel Aviv District",
            "Latitude": 32.103108,
            "Longitude": 34.833099,
            "Operator": "ScalaEv",
            "Duplicate Count": 11.0
        },
        {
            "Station Name": "TEN Baqa al-Gharbiyye",
            "Address": "Baqa al-Gharbiyye - Jat Industrial area  Isra",
            "City": "Haifa District",
            "Latitude": 32.422891,
            "Longitude": 35.035764,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "TEN Haifa - Oil Coast",
            "Address": "Ofir St 27  Haifa  Israel",
            "City": "Haifa District",
            "Latitude": 32.807432,
            "Longitude": 35.015821,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "TEN Zavdiel",
            "Address": "Zavdiel  Israel",
            "City": "South District",
            "Latitude": 31.652614,
            "Longitude": 34.762759,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Mul Hahof Village",
            "Address": "Prof. Shectman 10  Hadera  Israel",
            "City": "Hadera",
            "Latitude": 32.441372,
            "Longitude": 34.894313,
            "Operator": "ScalaEv",
            "Duplicate Count": 12.0
        },
        {
            "Station Name": "Ramat Yohanan - Clalit Clinic",
            "Address": "Ramat Yohanan  Israel",
            "City": "Ramat Yohanan",
            "Latitude": 32.793457,
            "Longitude": 35.122208,
            "Operator": "ScalaEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ramat Yohanan - Stable",
            "Address": "Ramat Yohanan  Israel",
            "City": "Ramat Yohanan",
            "Latitude": 32.794414,
            "Longitude": 35.126192,
            "Operator": "ScalaEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Klil Hayofi - Nof Hagalil",
            "Address": "Sderot Ma'ale Yitshak 23  Nof Hagalil  Israel",
            "City": "Natsrat Ilit",
            "Latitude": 32.702176,
            "Longitude": 35.321751,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Mivne Nof Hagalil Mall",
            "Address": "Derech HaHativot 1  Nof Hagalil  Israel",
            "City": "Natsrat Ilit",
            "Latitude": 32.698935,
            "Longitude": 35.310686,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ofer Big Mall - Petach Tikva",
            "Address": "Zeev Jabotinsky St 72  Petah Tikva  Israel",
            "City": "Petah Tikva",
            "Latitude": 32.093242,
            "Longitude": 34.865914,
            "Operator": "ScalaEv",
            "Duplicate Count": 10.0
        },
        {
            "Station Name": "Ramat Aviv Mall - North",
            "Address": "Einstein St 40  Tel Aviv-Yafo  Israel",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.112729,
            "Longitude": 34.795621,
            "Operator": "ScalaEv",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Ramat Aviv Mall - East",
            "Address": "Brodetsky St 43  Tel Aviv-Yafo  Israel",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.111977,
            "Longitude": 34.797617,
            "Operator": "ScalaEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Grand Canyon - Haifa",
            "Address": "Derech Simha Golan 54  Haifa  Israel",
            "City": "Haifa",
            "Latitude": 32.789818,
            "Longitude": 35.007433,
            "Operator": "ScalaEv",
            "Duplicate Count": 9.0
        },
        {
            "Station Name": "Ofer Big Mall - Petach Tikva Outdoor",
            "Address": "Zeev Jabotinsky St 72  Petah Tikva  Israel",
            "City": "Petah Tikva",
            "Latitude": 32.093644,
            "Longitude": 34.866333,
            "Operator": "ScalaEv",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Grand Canyon - Haifa (South)",
            "Address": "Derech Simha Golan 54  Haifa  Israel",
            "City": "Haifa",
            "Latitude": 32.788624,
            "Longitude": 35.007384,
            "Operator": "ScalaEv",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Piano Center - North",
            "Address": "Natan Yonatan St 10  Netanya  Israel",
            "City": "Netanya",
            "Latitude": 32.278688,
            "Longitude": 34.841821,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ofer Marom Neve Mall",
            "Address": "Khayim Landau St 7  Ramat Gan  Israel",
            "City": "Ramat Gan",
            "Latitude": 32.071594,
            "Longitude": 34.828264,
            "Operator": "ScalaEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ofer Sirkin Mall",
            "Address": "Elazar Fridman St 9  Petah Tikva  Israel",
            "City": "Petah Tikva",
            "Latitude": 32.079846,
            "Longitude": 34.902483,
            "Operator": "ScalaEv",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Sadash_Kfar Saba",
            "Address": "Yohanan HaSandlar 12",
            "City": "Kfar Saba",
            "Latitude": 32.175043,
            "Longitude": 34.928549,
            "Operator": "EdgeControl",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sadash_Ashdod",
            "Address": "Bnei Brit Boulevard",
            "City": "Ashdod",
            "Latitude": 31.796627,
            "Longitude": 34.652911,
            "Operator": "EdgeControl",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Grand Mall Beer Sheva - North Outdoor Parking",
            "Address": "David Tuviyahu Avenue 125",
            "City": "Be'er Sheva",
            "Latitude": 31.251187,
            "Longitude": 34.771328,
            "Operator": "ScalaEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Sadash_Gadera",
            "Address": "Herzl 77",
            "City": "Gedera",
            "Latitude": 31.817522,
            "Longitude": 34.772557,
            "Operator": "EdgeControl",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "HolyLand",
            "Address": "Holyland",
            "City": "Jerusalem",
            "Latitude": 31.757072,
            "Longitude": 35.188741,
            "Operator": "EdgeControl",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Grand Mall Beer Sheva - Indoor parking (-1)",
            "Address": "David Tuviyahu Avenue 125 Beersheba Israel",
            "City": "Be'er Sheva",
            "Latitude": 31.249621,
            "Longitude": 34.773008,
            "Operator": "ScalaEv",
            "Duplicate Count": 10.0
        },
        {
            "Station Name": "EinHanaziv_PaltzivFactory",
            "Address": "Ein HaNatziv",
            "City": "Ein HaNatziv",
            "Latitude": 32.468236,
            "Longitude": 35.500519,
            "Operator": "EdgeControl",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Had_Nes",
            "Address": "Ahuzat Zimmer Had Nes",
            "City": "Had Nes",
            "Latitude": 32.927514,
            "Longitude": 35.641408,
            "Operator": "EdgeControl",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "EinHanaziv_Neurim",
            "Address": "Ein HaNatziv",
            "City": "Ein HaNatziv",
            "Latitude": 32.470464,
            "Longitude": 35.500305,
            "Operator": "EdgeControl",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Ein_Hanaziv_Merkazia B",
            "Address": "Shachaf Street 8",
            "City": "Ein HaNatziv",
            "Latitude": 32.47234,
            "Longitude": 35.498602,
            "Operator": "EdgeControl",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Kibutz haztor_main parking",
            "Address": "Hatzor Ashdod",
            "City": "Hatzor Ashdod",
            "Latitude": 31.774835,
            "Longitude": 34.720888,
            "Operator": "EdgeControl",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Givat Haim Meuhad - 22 South",
            "Address": "Givat Haim Meuhad Israel",
            "City": "Givat Haim Meuhad",
            "Latitude": 32.393139,
            "Longitude": 34.932402,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sadash_Rishon Lezion",
            "Address": "Yosef Sapir 3 Rishon Lezion Israel",
            "City": "Rishon Lezion",
            "Latitude": 31.991255,
            "Longitude": 34.749595,
            "Operator": "EdgeControl",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sadash_Haifa",
            "Address": "HaNafach Street 40 Haifa Israel",
            "City": " Haifa",
            "Latitude": 32.785923,
            "Longitude": 35.037309,
            "Operator": "EdgeControl",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Givat Haim Meuhad - 22 East",
            "Address": "Givat Haim Meuhad Israel",
            "City": "Givat Haim Meuhad",
            "Latitude": 32.393852,
            "Longitude": 34.932498,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "NeotAviv Parking Lot - TLV",
            "Address": "Dubnov 7 Tel Aviv-Yafo Israel",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.075113,
            "Longitude": 34.783334,
            "Operator": "EdgeControl",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Kfar Kara _Local Council",
            "Address": "Kafr Qara Israel",
            "City": "Kafr Qara",
            "Latitude": 32.505808,
            "Longitude": 35.047237,
            "Operator": "EdgeControl",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Givat Haim Meuhad - Neurim East",
            "Address": "Givat Haim Meuhad Israel",
            "City": "Givat Haim Meuhad",
            "Latitude": 32.393649,
            "Longitude": 34.930781,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ben Gurion 258",
            "Address": "David Ben Gurion Street 258 Giv'atayim Israel",
            "City": "Giv'atayim",
            "Latitude": 32.066297,
            "Longitude": 34.815162,
            "Operator": "EdgeControl",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Jordan Valley Regional Council",
            "Address": "3FXV+FJG  Shlomzion",
            "City": "Shlomzion",
            "Latitude": 32.099009,
            "Longitude": 35.493865,
            "Operator": "EdgeControl",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Haemek hospital",
            "Address": "Haemek hospital",
            "City": "North District",
            "Latitude": 32.61906,
            "Longitude": 35.312586,
            "Operator": "EdgeControl",
            "Duplicate Count": 12.0
        },
        {
            "Station Name": "Givat Haim Meuhad - Neurim South",
            "Address": "Givat Haim Meuhad  Israel",
            "City": "Givat Haim Meuhad",
            "Latitude": 32.393439,
            "Longitude": 34.930157,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Zevulun North Herzliya",
            "Address": "Sderot Eli Landau 17 Herzliya Israel",
            "City": "Herzliya",
            "Latitude": 32.176054,
            "Longitude": 34.802377,
            "Operator": "EdgeControl",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Sapir Herzliya",
            "Address": "Sapir 7 Herzliya Israel",
            "City": "Herzliya",
            "Latitude": 32.163257,
            "Longitude": 34.810711,
            "Operator": "EdgeControl",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Givat Haim Meuhad - 14 North",
            "Address": "Givat Haim Meuhad Israel",
            "City": "Givat Haim Meuhad",
            "Latitude": 32.391293,
            "Longitude": 34.927177,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Lev haeir_parking lot",
            "Address": "Bar Ilan Street 2 Herzliya Israel",
            "City": "Tel Aviv District",
            "Latitude": 32.166122,
            "Longitude": 34.84249,
            "Operator": "EdgeControl",
            "Duplicate Count": 12.0
        },
        {
            "Station Name": "Haifa_court house",
            "Address": "Sderot HaPalyam 8 Haifa Israel",
            "City": "Haifa",
            "Latitude": 32.814889,
            "Longitude": 35.001434,
            "Operator": "EdgeControl",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Givat Haim Meuhad - Millionaire Parking",
            "Address": "Givat Haim Meuhad Israel",
            "City": "Givat Haim Meuhad",
            "Latitude": 32.390987,
            "Longitude": 34.92828,
            "Operator": "ScalaEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Kafrit Group",
            "Address": "Kfar Aza Israel",
            "City": "Kfar Aza",
            "Latitude": 31.48228,
            "Longitude": 34.535909,
            "Operator": "EdgeControl",
            "Duplicate Count": 10.0
        },
        {
            "Station Name": "Museum Tower",
            "Address": "Berkowitz 4 Tel Aviv-Yafo Israel",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.078542,
            "Longitude": 34.787,
            "Operator": "EdgeControl",
            "Duplicate Count": 10.0
        },
        {
            "Station Name": "Shevach Parking",
            "Address": "Shevah Street 1 Tel Aviv-Yafo Israel",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.061417,
            "Longitude": 34.783498,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kibbutz Nachshon_Factory",
            "Address": "Khalelei Egoz Street 15 Lod Israel",
            "City": "Lod",
            "Latitude": 31.829089,
            "Longitude": 34.955177,
            "Operator": "EdgeControl",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Herzelia_Marina",
            "Address": "Herzliya Israel",
            "City": "Herzliya",
            "Latitude": 32.16383,
            "Longitude": 34.797773,
            "Operator": "EdgeControl",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "HaBanim Parking - Tveria",
            "Address": "Ha-Banim St 1001  Tiberias  Israel",
            "City": "Tiberias",
            "Latitude": 32.785993,
            "Longitude": 35.541364,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Charging complex in Beit Berl",
            "Address": "6W3G+6H Beit Berl Israel",
            "City": "Beit Berl",
            "Latitude": 32.20307,
            "Longitude": 34.926481,
            "Operator": "EdgeControl",
            "Duplicate Count": 10.0
        },
        {
            "Station Name": "Kibbutz Nachshon_Secretariat",
            "Address": "RXJ4+64 Nachshon Israel",
            "City": "Nakhshon",
            "Latitude": 31.830525,
            "Longitude": 34.9553,
            "Operator": "EdgeControl",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ofer the Hill Mall",
            "Address": "Yoni Netanyahu St 29  Giv'at Shmuel  Israel",
            "City": "Giv'at Shmuel",
            "Latitude": 32.077168,
            "Longitude": 34.854743,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kibbutz Nachshon_Pool",
            "Address": "RXJ5+F6 Nachshon Israel",
            "City": "Nakhshon",
            "Latitude": 31.831228,
            "Longitude": 34.958018,
            "Operator": "EdgeControl",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kibbutz Nachshon_Zinorot Br.",
            "Address": "RXM4+5X Nachshon Israel",
            "City": "Nakhshon",
            "Latitude": 31.832969,
            "Longitude": 34.957394,
            "Operator": "EdgeControl",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ofer Bilu Center - South",
            "Address": "411  Kiryat Ekron  Israel",
            "City": "Kiryat Ekron",
            "Latitude": 31.861883,
            "Longitude": 34.816378,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Herzelia_Country-club",
            "Address": "Zabotinsky 85 Herzliya Israel",
            "City": "Herzliya",
            "Latitude": 32.166449,
            "Longitude": 34.826417,
            "Operator": "EdgeControl",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Herzelia_Hasadnaot",
            "Address": "HaSadnaot 12 Herzliya Israel",
            "City": "Herzliya",
            "Latitude": 32.159929,
            "Longitude": 34.805515,
            "Operator": "EdgeControl",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ofer Bilu Center",
            "Address": "Bilu Center Kiryat Ekron Israel",
            "City": "Kiryat Ekron",
            "Latitude": 31.862846,
            "Longitude": 34.816228,
            "Operator": "ScalaEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Mountains of Gilead 4",
            "Address": "Harei HaGilad 4 Ramat Gan Israel",
            "City": "Ramat Gan",
            "Latitude": 32.084189,
            "Longitude": 34.804585,
            "Operator": "EdgeControl",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "SHAHAK INDUSTRIAL PARK",
            "Address": "8G4QF5FH+Q9",
            "City": "Shchak Industrial Zone",
            "Latitude": 32.474406,
            "Longitude": 35.178427,
            "Operator": "EdgeControl",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kfar Hahoresh - Ganim",
            "Address": "Gordonia 13 Kfar Hahoresh 1696000 Israel",
            "City": "Kfar Hahoresh",
            "Latitude": 32.699271,
            "Longitude": 35.272387,
            "Operator": "ScalaEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Golden_mall",
            "Address": "David Sakharov 21 Rishon Lezion Israel",
            "City": "Rishon Lezion",
            "Latitude": 31.990604,
            "Longitude": 34.774915,
            "Operator": "EdgeControl",
            "Duplicate Count": 12.0
        },
        {
            "Station Name": "Idelson Parking",
            "Address": "Idelson Street 8 Tel Aviv-Yafo Israel",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.073755,
            "Longitude": 34.767734,
            "Operator": "ScalaEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Harish_Mall",
            "Address": "Turquoise 3 Harish Israel",
            "City": "Harish",
            "Latitude": 32.462443,
            "Longitude": 35.047018,
            "Operator": "EdgeControl",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "O-TECH",
            "Address": "Atir Yeda 1 Kfar Saba Israel",
            "City": "Kfar Saba",
            "Latitude": 32.167423,
            "Longitude": 34.928529,
            "Operator": "EdgeControl",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ofer Bilu Center - North",
            "Address": "Bilu Center Kiryat Ekron Israel",
            "City": "Kiryat Ekron",
            "Latitude": 31.865317,
            "Longitude": 34.815936,
            "Operator": "ScalaEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "City Gate",
            "Address": "Hes 48 Herzliya Israel",
            "City": "Herzliya",
            "Latitude": 32.162988,
            "Longitude": 34.841737,
            "Operator": "EdgeControl",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Hamasger 22 Hadera",
            "Address": "HaMasger 22 Hadera Israel",
            "City": "Hadera",
            "Latitude": 32.449391,
            "Longitude": 34.914005,
            "Operator": "EdgeControl",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Hacarmel 1 Or Akiva",
            "Address": "HaCarmel 1 Or Akiva Israel",
            "City": "Or Akiva",
            "Latitude": 32.517711,
            "Longitude": 34.916372,
            "Operator": "EdgeControl",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "HaOgen 4_Parking-Lot_Herzelia",
            "Address": "HaOgen 1 Herzliya Israel",
            "City": "Herzliya",
            "Latitude": 32.158654,
            "Longitude": 34.794544,
            "Operator": "EdgeControl",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Kinor",
            "Address": "North East Kinneret Ramot",
            "City": "Tiberias",
            "Latitude": 32.86206,
            "Longitude": 35.64563,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Kibbutz Be'eri",
            "Address": "Kibbutz Be'eri",
            "City": "Kibbutz Be'eri",
            "Latitude": 31.42811,
            "Longitude": 34.4933,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Azrieli Rishonim Train Station Parking (Fast)",
            "Address": "Sderot Nim 1",
            "City": "Rishon Lezion",
            "Latitude": 31.9491287,
            "Longitude": 34.8042648,
            "Operator": "SonolEvi",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Hebrew University, Givat Ram",
            "Address": "Kosel Parking Lot, Museum Avenue",
            "City": "Jerusalem",
            "Latitude": 31.7774543,
            "Longitude": 35.1998145,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Kibbutz Afikim",
            "Address": "Kibbutz Afikim",
            "City": "Kibbutz Afikim",
            "Latitude": 32.679845,
            "Longitude": 35.5783888,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "2359 Hadassah Mount Scopus Parking (Employee Parking)",
            "Address": "Sderot Churchill 8",
            "City": "Jerusalem",
            "Latitude": 31.7976954,
            "Longitude": 35.2411693,
            "Operator": "SonolEvi",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "2360 Hadassah Mount Scopus Parking 2 (Rehabilitation Wing)",
            "Address": "Hadassah Mount Scopus Parking Lot 2",
            "City": "Jerusalem",
            "Latitude": 31.798947,
            "Longitude": 35.242299,
            "Operator": "SonolEvi",
            "Duplicate Count": 16.0
        },
        {
            "Station Name": "Mini Israel Parking 1",
            "Address": "Mini Israel Park",
            "City": "Latrun Junction",
            "Latitude": 31.843239,
            "Longitude": 34.968929,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Mini Israel Parking 2",
            "Address": "Mini Israel Park",
            "City": "Latrun Junction",
            "Latitude": 31.046051,
            "Longitude": 34.851612,
            "Operator": "SonolEvi",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Lotan - Poolside Parking",
            "Address": "Lotan - Parking Near the Pool",
            "City": "Lotan",
            "Latitude": 29.9896873,
            "Longitude": 35.088084,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sonol Tiberias City",
            "Address": "Elhadeif 33",
            "City": "Tiberias",
            "Latitude": 32.789561,
            "Longitude": 35.540004,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Urim",
            "Address": "Urim",
            "City": "Urim",
            "Latitude": 31.304094,
            "Longitude": 34.524868,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Palace Modiin",
            "Address": "Tzalon 1",
            "City": "Modi'in",
            "Latitude": 31.9085009,
            "Longitude": 35.0138348,
            "Operator": "SonolEvi",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Urim - Narkisim Neighborhood",
            "Address": "Urim",
            "City": "Urim",
            "Latitude": 31.304094,
            "Longitude": 34.524868,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Rambam Ra'anana",
            "Address": "Rambam 12",
            "City": "Ra'anana",
            "Latitude": 32.1791247,
            "Longitude": 34.8769873,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Badolach Netivot Parking",
            "Address": "Badolach 12",
            "City": "Netivot",
            "Latitude": 31.42027,
            "Longitude": 34.5711651,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kibbutz Erez",
            "Address": "Kibbutz Erez",
            "City": "Kibbutz Erez",
            "Latitude": 31.55984,
            "Longitude": 34.564889,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ashdot Yaakov Ichud",
            "Address": "Ashdot Yaakov Ihud",
            "City": "Ashdot Ya'akov Ihud",
            "Latitude": 32.6576048,
            "Longitude": 35.5809513,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Galil Yam Pool",
            "Address": "Galil Yam",
            "City": "Galil Yam",
            "Latitude": 32.1572529,
            "Longitude": 34.8333271,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sonol Atlit DC",
            "Address": "Sonol Atlit",
            "City": "Atlit",
            "Latitude": 32.7101179,
            "Longitude": 34.9479464,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Galil Yam Secretariat (Near Dining Hall)",
            "Address": "Galil Yam",
            "City": "Galil Yam",
            "Latitude": 32.156754,
            "Longitude": 34.831138,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ga'ash Kibbutz Commercial Center",
            "Address": "Kibbutz Gaash",
            "City": "Kibbutz Ga'ash",
            "Latitude": 32.2257843,
            "Longitude": 34.826622,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Kibbutz Geshur",
            "Address": "Kibbutz Geshur",
            "City": "Kibbutz Geshur",
            "Latitude": 32.8197336,
            "Longitude": 35.7160728,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Kibbutz Hulda 1",
            "Address": "Kibbutz Hulda",
            "City": "Kibbutz Hulda",
            "Latitude": 31.83215,
            "Longitude": 34.881523,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kibbutz Hulda 2",
            "Address": "Kibbutz Hulda",
            "City": "Kibbutz Hulda",
            "Latitude": 31.83215,
            "Longitude": 34.881523,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kiryat Gan Community Center (Rishon Lezion)",
            "Address": "Ushe 18",
            "City": "Rishon Lezion",
            "Latitude": 31.965126,
            "Longitude": 34.777301,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Yagur Junction Commercial Center",
            "Address": "Derech Shomer HaMesilah",
            "City": "Yagur",
            "Latitude": 32.7494199,
            "Longitude": 35.0693134,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Yigal Alon Community Center (Rishon Lezion)",
            "Address": "Yigal Alon 30",
            "City": "Rishon Lezion",
            "Latitude": 31.955092,
            "Longitude": 34.815161,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ma'agan Holiday Village",
            "Address": "Maagan Holiday Village",
            "City": "Ma'agan Holiday Village",
            "Latitude": 32.706344,
            "Longitude": 35.600575,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Kramim Community Center (Rishon Lezion)",
            "Address": "HaYain 2",
            "City": "Rishon Lezion",
            "Latitude": 31.9735887,
            "Longitude": 34.7785213,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Kfar Szold Headquarters",
            "Address": "Kfar Szold",
            "City": "Kfar Szold",
            "Latitude": 33.196835,
            "Longitude": 35.658119,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Mini Israel Parking 3",
            "Address": "Mini Israel Park",
            "City": "Latrun Junction",
            "Latitude": 31.842235,
            "Longitude": 34.967943,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kfar Szold Rural Lodging",
            "Address": "Kfar Szold",
            "City": "Kfar Szold",
            "Latitude": 33.194007,
            "Longitude": 35.657039,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Lavi Hotel",
            "Address": "Kibbutz Lavi",
            "City": "Kibbutz Lavi",
            "Latitude": 32.785835,
            "Longitude": 35.4388503,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Bikur Rofe Ariel",
            "Address": "Derech HaNehoshtim 69 A",
            "City": "Ariel",
            "Latitude": 32.103638,
            "Longitude": 35.168781,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kibbutz Magal Dining Hall",
            "Address": "Kibbutz Magal",
            "City": "Kibbutz Magal",
            "Latitude": 32.384733,
            "Longitude": 35.038366,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kibbutz Magal Expansion Neighborhood",
            "Address": "Kibbutz Magal",
            "City": "Kibbutz Magal",
            "Latitude": 32.385485,
            "Longitude": 35.031952,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Pastoral Hotel Kfar Blum",
            "Address": "Pastoral Hotel Kfar Blum",
            "City": "Pastoral Hotel Kfar Blum",
            "Latitude": 33.1745655,
            "Longitude": 35.612428,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Mishmar HaShiv'a",
            "Address": "Mish'abe Sadeh",
            "City": "Sde Boker",
            "Latitude": 31.0036379,
            "Longitude": 34.7874382,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Hadassah Arza Dealer",
            "Address": "Givat Eden",
            "City": "Eden Hills",
            "Latitude": 31.662171,
            "Longitude": 35.013876,
            "Operator": "SonolEvi",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Mishmar HaShiv'a 2",
            "Address": "Mish'abe Sadeh",
            "City": "Sde Boker",
            "Latitude": 31.0002748,
            "Longitude": 34.7855171,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Hebrew University - Mount Scopus Campus",
            "Address": "Mount Scopus University Parking Lot",
            "City": "Jerusalem",
            "Latitude": 31.79693,
            "Longitude": 35.238201,
            "Operator": "SonolEvi",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Eden Al HaMayim Event Hall",
            "Address": "Kibbutz Nir Eliyahu",
            "City": "Kibbutz Nir Eliyahu",
            "Latitude": 32.1965535,
            "Longitude": 34.9455019,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Sonol Ma'of Ir Ovot",
            "Address": "Sonol Ir Ovot",
            "City": "Sonol Air Ofakim",
            "Latitude": 30.813244,
            "Longitude": 35.245812,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kibbutz Nachshonim Secretariat",
            "Address": "Kibbutz Nachshonim",
            "City": "Kibbutz Nachshonim",
            "Latitude": 32.0596814,
            "Longitude": 34.9489467,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ein HaShlosha South",
            "Address": "Kibbutz Ein HaShlosha",
            "City": "Kibbutz Ein HaShlosha",
            "Latitude": 31.3502227,
            "Longitude": 34.3997991,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Rishon Lezion Orchestra",
            "Address": "HaTizmoret 12",
            "City": "Rishon Lezion",
            "Latitude": 31.968442,
            "Longitude": 34.774836,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Kibbutz Nir Oz - Cooperative Housing",
            "Address": "Nir Oz",
            "City": "Nir Oz",
            "Latitude": 31.312016,
            "Longitude": 34.4032014,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Netiv HaLamed-Heh",
            "Address": "Netiv HaLamed-Heh",
            "City": "Netiv HaLamed-Heh",
            "Latitude": 31.687184,
            "Longitude": 34.982523,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Kibbutz Ketura",
            "Address": "Kibbutz Ketura",
            "City": "Kibbutz Ketura",
            "Latitude": 29.9698275,
            "Longitude": 35.0624923,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Parking Lot H1",
            "Address": "Eliezer Kaplan 1",
            "City": "Jerusalem",
            "Latitude": 31.7775902,
            "Longitude": 35.2045633,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Pecan Garden Parking",
            "Address": "Gan HaPecan",
            "City": "Kibbutz Ramat HaKovesh",
            "Latitude": 32.220761,
            "Longitude": 34.93892,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Water Well Parking",
            "Address": "Kibbutz Yakum",
            "City": "Kibbutz Yakum",
            "Latitude": 32.247083,
            "Longitude": 34.841855,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kibbutz Tzora",
            "Address": "Kibbutz Tzora",
            "City": "Kibbutz Tzora",
            "Latitude": 31.7639118,
            "Longitude": 34.9656114,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Sonol Vradia",
            "Address": "Sonol Vardia",
            "City": "Haifa",
            "Latitude": 32.7914326,
            "Longitude": 34.9974419,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Eretz Tze'elim Hotel",
            "Address": "Kibbutz Tze’elim",
            "City": "Kibbutz Tze",
            "Latitude": 31.201823,
            "Longitude": 34.53262,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kibbutz Tze'elim - New Neighborhood",
            "Address": "Kibbutz Tze’elim",
            "City": "Kibbutz Tze",
            "Latitude": 31.2051113,
            "Longitude": 34.5315431,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sonol Mishmar HaYarden",
            "Address": "Sonol Mishmar HaYarden",
            "City": "Mashmar HaYarden",
            "Latitude": 33.0006265,
            "Longitude": 35.5983577,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kibbutz Beit Oren - Cabin Event Parking",
            "Address": "Kibbutz Beit Oren",
            "City": "Kibbutz Beit Oren",
            "Latitude": 32.730783,
            "Longitude": 35.007067,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Lotan Main Parking",
            "Address": "Lotan",
            "City": "Lotan",
            "Latitude": 29.9873753,
            "Longitude": 35.0860443,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Independence Garden",
            "Address": "Menashe Ben Israel",
            "City": "Jerusalem",
            "Latitude": 31.779078,
            "Longitude": 35.219008,
            "Operator": "SonolEvi",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Lotan - Northern Parking",
            "Address": "Lotan",
            "City": "Lotan",
            "Latitude": 29.9901577,
            "Longitude": 35.0864391,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Azrieli Jerusalem (Fast Charging Stations)",
            "Address": "Derech Agudat Sport Beitar 1 Parking Lot 10",
            "City": "Jerusalem",
            "Latitude": 31.750771,
            "Longitude": 35.187374,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Avshalom Regional Factories",
            "Address": "Beit Kama Junction",
            "City": "Beit Kama Junction",
            "Latitude": 31.4415422,
            "Longitude": 34.7611615,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Sonol Denya Haifa",
            "Address": "Abba Hushi 111",
            "City": "Haifa",
            "Latitude": 32.7692821,
            "Longitude": 35.0076532,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Azrieli Mall Tel Aviv-Yafo",
            "Address": "Derech Menachem Begin 132",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.074437,
            "Longitude": 34.792187,
            "Operator": "SonolEvi",
            "Duplicate Count": 27.0
        },
        {
            "Station Name": "Azrieli Mall Holon",
            "Address": "Golda Meir 7",
            "City": "Holon",
            "Latitude": 32.012313,
            "Longitude": 34.779438,
            "Operator": "SonolEvi",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Azrieli Mall Givatayim",
            "Address": "Yitzhak Rabin 53",
            "City": "Giv'atayim",
            "Latitude": 32.066562,
            "Longitude": 34.810187,
            "Operator": "SonolEvi",
            "Duplicate Count": 15.0
        },
        {
            "Station Name": "Zedekiah Parking (Level -3)",
            "Address": "HaCarmel 20",
            "City": "Rishon Lezion",
            "Latitude": 31.962065,
            "Longitude": 34.8048033,
            "Operator": "SonolEvi",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Palace Senior Housing Network",
            "Address": "Sha'ura 1",
            "City": "Lehavim",
            "Latitude": 31.373835,
            "Longitude": 34.816952,
            "Operator": "SonolEvi",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Azrieli Mall Rishonim",
            "Address": "Sderot Nim 2",
            "City": "Rishon Lezion",
            "Latitude": 31.949438,
            "Longitude": 34.804063,
            "Operator": "SonolEvi",
            "Duplicate Count": 10.0
        },
        {
            "Station Name": "Azrieli Outlet Herzliya",
            "Address": "Medinat HaYehudim 85",
            "City": "Herzliya",
            "Latitude": 32.1669919,
            "Longitude": 34.8108401,
            "Operator": "SonolEvi",
            "Duplicate Count": 9.0
        },
        {
            "Station Name": "Azrieli Mall Haifa",
            "Address": "Derech Moshe Fliman 4",
            "City": "Haifa",
            "Latitude": 32.7892939,
            "Longitude": 34.9633988,
            "Operator": "SonolEvi",
            "Duplicate Count": 7.0
        },
        {
            "Station Name": "Azrieli Mall Ramla",
            "Address": "David Razi’el 1",
            "City": "Ramla",
            "Latitude": 31.925688,
            "Longitude": 34.863937,
            "Operator": "SonolEvi",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Azrieli Mall Jerusalem",
            "Address": "Derech Agudat Sport Beitar 1",
            "City": "Jerusalem",
            "Latitude": 31.751562,
            "Longitude": 35.187188,
            "Operator": "SonolEvi",
            "Duplicate Count": 9.0
        },
        {
            "Station Name": "Azrieli Mall Negev",
            "Address": "Eli Cohen Junction",
            "City": "Be'er Sheva",
            "Latitude": 31.243437,
            "Longitude": 34.795812,
            "Operator": "SonolEvi",
            "Duplicate Count": 7.0
        },
        {
            "Station Name": "Azrieli Mall Modiin",
            "Address": "Lev HaIr 2",
            "City": "Modi'in",
            "Latitude": 31.899687,
            "Longitude": 35.007687,
            "Operator": "SonolEvi",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Sonol Hermon Junction",
            "Address": "Hutzot Hermon",
            "City": "Restaurant",
            "Latitude": 33.2221756,
            "Longitude": 35.7595139,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Azrieli Mall Hod Hasharon",
            "Address": "Zabotinsky 3",
            "City": "Hod HaSharon",
            "Latitude": 32.143437,
            "Longitude": 34.891687,
            "Operator": "SonolEvi",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Azrieli Mall Acre",
            "Address": "HaHaroshet 2",
            "City": "Acre",
            "Latitude": 32.922938,
            "Longitude": 35.081313,
            "Operator": "SonolEvi",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Kibbutz Dorot",
            "Address": "Kibbutz D’rorot",
            "City": "Kibbutz Dorot",
            "Latitude": 31.505547,
            "Longitude": 34.646099,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Azrieli Center Holon",
            "Address": "HaRokmim 26",
            "City": "Holon",
            "Latitude": 32.0076095,
            "Longitude": 34.8010583,
            "Operator": "SonolEvi",
            "Duplicate Count": 13.0
        },
        {
            "Station Name": "Azrieli Center Sarona",
            "Address": "Derech Menachem Begin 121",
            "City": "Tel Aviv",
            "Latitude": 32.071812,
            "Longitude": 34.789062,
            "Operator": "SonolEvi",
            "Duplicate Count": 17.0
        },
        {
            "Station Name": "Kfir Mall Kiryat Ata",
            "Address": "HaAtzma’ut 37 Kiryat Ata",
            "City": "Kiryat Ata",
            "Latitude": 32.8035776,
            "Longitude": 35.1035365,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Sonol Rosh Pina",
            "Address": "Rosh Pina to Kiryat Shmona Highway",
            "City": "Rosh Pina",
            "Latitude": 32.964438,
            "Longitude": 35.548438,
            "Operator": "SonolEvi",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Sonol Nahariya",
            "Address": "Sderot Shazar",
            "City": "Nahariya",
            "Latitude": 32.988687,
            "Longitude": 35.095062,
            "Operator": "SonolEvi",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Sonol Hadera City",
            "Address": "Ya’akov Dori 37",
            "City": "Hadera",
            "Latitude": 32.440938,
            "Longitude": 34.910562,
            "Operator": "SonolEvi",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Sonol Ad Halom",
            "Address": "Derech Menachem Begin",
            "City": "Ashdod",
            "Latitude": 31.778563,
            "Longitude": 34.664062,
            "Operator": "SonolEvi",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Sonol Dimona",
            "Address": "HaPo’alim",
            "City": "Dimona",
            "Latitude": 31.064312,
            "Longitude": 35.016312,
            "Operator": "SonolEvi",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Jordan Valley, Ganei Tikva",
            "Address": "Jordan Valley",
            "City": "Ganei Tikva",
            "Latitude": 32.062702,
            "Longitude": 34.870598,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sonol Yeruham",
            "Address": "Highway 204",
            "City": "Yeruham",
            "Latitude": 30.991438,
            "Longitude": 34.913188,
            "Operator": "SonolEvi",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Sonol Kfar Adumim",
            "Address": "Kfar Adumim Junction",
            "City": "Kfar Adumim",
            "Latitude": 31.814937,
            "Longitude": 35.349688,
            "Operator": "SonolEvi",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Sonol Rishonim",
            "Address": "Herzl 151",
            "City": "Rishon Lezion",
            "Latitude": 31.946938,
            "Longitude": 34.801812,
            "Operator": "SonolEvi",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Sonol Golani Junction",
            "Address": "Highway 77",
            "City": "Tur'an",
            "Latitude": 32.772437,
            "Longitude": 35.393687,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sonol Sharon Junction",
            "Address": "Derech HaRakevet 7",
            "City": "Netanya",
            "Latitude": 32.321062,
            "Longitude": 34.867563,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sonol Modiin Shilat",
            "Address": "Highway 443",
            "City": "Modi'in",
            "Latitude": 31.914813,
            "Longitude": 35.016187,
            "Operator": "SonolEvi",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Sonol Samson Junction",
            "Address": "Shimson Junction",
            "City": "Eshtaol",
            "Latitude": 31.7759231,
            "Longitude": 35.0089994,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sonol Plugot Junction",
            "Address": "Plugot Junction",
            "City": "Kiryat Gat",
            "Latitude": 31.626937,
            "Longitude": 34.760062,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Zabotinsky 61 - Outdoor Parking",
            "Address": "Zabotinsky 61",
            "City": "Rishon Lezion",
            "Latitude": 31.9663432,
            "Longitude": 34.7993105,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Sonol Eilat City",
            "Address": "HaT’vuna 1",
            "City": "Eilat",
            "Latitude": 29.5602684,
            "Longitude": 34.9574648,
            "Operator": "SonolEvi",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "2103 Katamon - Hezekiah HaMelech",
            "Address": "Hezekiah the King",
            "City": "Jerusalem",
            "Latitude": 31.7610559,
            "Longitude": 35.2094394,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Sonol Ariel",
            "Address": "Ariel Junction",
            "City": "Ariel",
            "Latitude": 32.108312,
            "Longitude": 35.163687,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "2104 Beit HaKerem - WIZO Square",
            "Address": "HaChalutz Corner HaMeyasdim",
            "City": "Jerusalem",
            "Latitude": 31.7771071,
            "Longitude": 35.1909848,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "2112 Pisgat Ze'ev - Meir Gershon & Yehoshua Junction",
            "Address": "Meir Gershon Corner Yosha Pisgat Ze’ev",
            "City": "Jerusalem",
            "Latitude": 31.8191825,
            "Longitude": 35.2477822,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Sha'ar HaTzafon Mall (Upper Parking)",
            "Address": "Derech Haifa 30",
            "City": "Kiryat Ata",
            "Latitude": 32.8070679,
            "Longitude": 35.0767899,
            "Operator": "SonolEvi",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "2115 Ramot - Ma'ale Ramot Community Center",
            "Address": "Sderot Golda Meir 474",
            "City": "Jerusalem",
            "Latitude": 31.8231612,
            "Longitude": 35.1903845,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "2116 East City - St. George",
            "Address": "Saint George",
            "City": "Jerusalem",
            "Latitude": 31.7896975,
            "Longitude": 35.2286768,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kfar HaNassi",
            "Address": "Kfar HaNasi",
            "City": "Kfar HaNasi",
            "Latitude": 32.9748192,
            "Longitude": 35.6039963,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "2119 Har Nof - Zarch Barnett",
            "Address": "Zarch Barnet",
            "City": "Jerusalem",
            "Latitude": 31.781586,
            "Longitude": 35.175884,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Neighborhood A - Netzer Sereni",
            "Address": "Neighborhood A - Nitzan Serney",
            "City": "Kibbutz Nitzan",
            "Latitude": 31.922789,
            "Longitude": 34.81887,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Kibbutz Magen",
            "Address": "Kibbutz Magen",
            "City": "Kibbutz Magen",
            "Latitude": 31.299564,
            "Longitude": 34.424771,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "2101 Beit HaKerem - HaChalutz & Herzl Junction",
            "Address": "HaChalutz 3",
            "City": "Jerusalem",
            "Latitude": 31.782194,
            "Longitude": 35.1927684,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "2106 Baka - Rivka",
            "Address": "Rivka 17",
            "City": "Jerusalem",
            "Latitude": 31.7548746,
            "Longitude": 35.2167156,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "2114 Armon HaNatziv - Alkahi & Raziel Junction",
            "Address": "Mordechai El’kahi 49",
            "City": "Jerusalem",
            "Latitude": 31.7521901,
            "Longitude": 35.231802,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "2102 Nayot - Yehoshua Yavin",
            "Address": "Yehoshua Yibin",
            "City": "Jerusalem",
            "Latitude": 31.7684794,
            "Longitude": 35.2047189,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "2107 Katamon - Rachel Imenu",
            "Address": "Rachel Imenu 12",
            "City": "Jerusalem",
            "Latitude": 31.763599,
            "Longitude": 35.216728,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Kibbutz Kinneret - Supermarket Parking",
            "Address": "Kibbutz Kinneret",
            "City": "Kibbutz Kinneret",
            "Latitude": 32.714883,
            "Longitude": 35.563155,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kibbutz Kinneret - Tamarim Parking A",
            "Address": "Kibbutz Kinneret",
            "City": "Kibbutz Kinneret",
            "Latitude": 32.712637,
            "Longitude": 35.558326,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kibbutz Kinneret - Centennial Boulevard",
            "Address": "Kibbutz Kinneret",
            "City": "Kibbutz Kinneret",
            "Latitude": 32.713877,
            "Longitude": 35.561449,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Netzer Sereni Tennis Courts",
            "Address": "Tennis Courts - Nitzan Serney",
            "City": "Kibbutz Nitzan",
            "Latitude": 31.921619,
            "Longitude": 34.823387,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sonol Asphalt South",
            "Address": "HaManof 1",
            "City": "Be'er Sheva",
            "Latitude": 31.2274105,
            "Longitude": 34.8124948,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Industrial Office Parking - Netzer Sereni",
            "Address": "Kibbutz Nitzan Serney",
            "City": "Kibbutz Nitzan",
            "Latitude": 31.926913,
            "Longitude": 34.825173,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Sonol Iron Junction",
            "Address": "Sonol Iron",
            "City": "Hannah Junction",
            "Latitude": 32.4590028,
            "Longitude": 34.9877159,
            "Operator": "SonolEvi",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "2207 Givat Massuah - Yaakov Tzur",
            "Address": "Ya’akov Tzur",
            "City": "Jerusalem",
            "Latitude": 31.750604,
            "Longitude": 35.166792,
            "Operator": "SonolEvi",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Kibbutz Mizra - Western Lodging Parking",
            "Address": "Kibbutz Mizra",
            "City": "Kibbutz Mizra",
            "Latitude": 32.65139,
            "Longitude": 35.283008,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kibbutz Dalia - Neighborhood Parking B",
            "Address": "Kibbutz Dalia",
            "City": "Kibbutz Dalia",
            "Latitude": 32.588037,
            "Longitude": 35.070318,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sonol Yagur",
            "Address": "Sonol Yagur",
            "City": "Yagur",
            "Latitude": 32.75565,
            "Longitude": 35.061598,
            "Operator": "SonolEvi",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Dead Sea Works, Sodom",
            "Address": "Dead Sea Works",
            "City": "Sodom",
            "Latitude": 31.029189,
            "Longitude": 35.363469,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Sonol Beit Yanai",
            "Address": "Sonol Beitan Aharon",
            "City": "Beit Yannay",
            "Latitude": 32.360992,
            "Longitude": 34.868065,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Sonol Haifa Sha'ar HaAliyah",
            "Address": "Sderot HaHagana",
            "City": "Haifa",
            "Latitude": 32.819437,
            "Longitude": 34.955562,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sonol Eilot Herzliya",
            "Address": "Menachem Begin",
            "City": "Herzliya",
            "Latitude": 32.178563,
            "Longitude": 34.831313,
            "Operator": "SonolEvi",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "City Towers Mall Parking",
            "Address": "Mordechai HaGhetto 49",
            "City": "Rishon Lezion",
            "Latitude": 31.954654,
            "Longitude": 34.821146,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "HaHof Mall - Western Parking (Opposite Zara)",
            "Address": "Shikhtman 10",
            "City": "Hadera",
            "Latitude": 32.4414101,
            "Longitude": 34.893589,
            "Operator": "SonolEvi",
            "Duplicate Count": 7.0
        },
        {
            "Station Name": "Beit Maccabi",
            "Address": "Golda Meir 21",
            "City": "Rishon Lezion",
            "Latitude": 31.969025,
            "Longitude": 34.78603,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "2113 Baka - Station Complex",
            "Address": "Derech Hevron 28",
            "City": "Jerusalem",
            "Latitude": 31.765064,
            "Longitude": 35.225109,
            "Operator": "SonolEvi",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Kfar Aza - Electric Room Parking",
            "Address": "Kfar Aza",
            "City": "Kfar Aza",
            "Latitude": 31.4834624,
            "Longitude": 34.5333614,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Kfar Aza - Bus Station Parking",
            "Address": "Kfar Aza",
            "City": "Kfar Aza",
            "Latitude": 31.4838346,
            "Longitude": 34.5330963,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Herzl Center",
            "Address": "Herzl 39",
            "City": "Gan Yavne",
            "Latitude": 31.783056,
            "Longitude": 34.703101,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Daniel Hotel, Dead Sea",
            "Address": "Daniel Hotel",
            "City": "Ein Bokek",
            "Latitude": 31.194268,
            "Longitude": 35.361032,
            "Operator": "SonolEvi",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Sonol Misgav Tel Aviv",
            "Address": "Ben Tzvi 94",
            "City": "Tel Aviv",
            "Latitude": 32.0409137,
            "Longitude": 34.7732593,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Magic Kass",
            "Address": "D’kalah 6",
            "City": "Ma'ale Adumim",
            "Latitude": 31.785247,
            "Longitude": 35.330356,
            "Operator": "SonolEvi",
            "Duplicate Count": 13.0
        },
        {
            "Station Name": "Ra’anana Yovel Parking Lot",
            "Address": "Ahuzat 142",
            "City": "Ra'anana",
            "Latitude": 32.1816028,
            "Longitude": 34.871399,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ra’anana Gamla Parking Lot",
            "Address": "Derech Yerushalayim",
            "City": "Ra'anana",
            "Latitude": 32.186556,
            "Longitude": 34.854817,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Design City",
            "Address": "Sderot HaMeyasdim 15",
            "City": "Ma'ale Adumim",
            "Latitude": 31.7964838,
            "Longitude": 35.3334889,
            "Operator": "SonolEvi",
            "Duplicate Count": 24.0
        },
        {
            "Station Name": "Kibbutz Afikim - Suburban Parking",
            "Address": "Kibbutz Afikim",
            "City": "Kibbutz Afikim",
            "Latitude": 32.680564,
            "Longitude": 35.57773,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ra’anana - Sold Street",
            "Address": "Henrietta Szold 2",
            "City": "Ra'anana",
            "Latitude": 32.1783337,
            "Longitude": 34.882105,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Opsterland",
            "Address": "Opsterland 6",
            "City": "Ra'anana",
            "Latitude": 32.1802149,
            "Longitude": 34.8702126,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "HaYetzira 12",
            "Address": "HaYetzira 12",
            "City": "Ra'anana",
            "Latitude": 32.1951037,
            "Longitude": 34.876334,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ra’anana - Aviv High School",
            "Address": "HaPerahim 1",
            "City": "Ra'anana",
            "Latitude": 32.176607,
            "Longitude": 34.861681,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Yair Stern",
            "Address": "Yair Stern 5",
            "City": "Ra'anana",
            "Latitude": 32.1954155,
            "Longitude": 34.8477775,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Moshe Hess",
            "Address": "Hess 10",
            "City": "Ra'anana",
            "Latitude": 32.1748976,
            "Longitude": 34.8720023,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ra’anana - HaAchva 1",
            "Address": "HaAchvah 1",
            "City": "Ra'anana",
            "Latitude": 32.1958406,
            "Longitude": 34.8566223,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Weizmann",
            "Address": "Weizmann",
            "City": "Ra'anana",
            "Latitude": 32.1923362,
            "Longitude": 34.8458381,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sportek Neve Zemer",
            "Address": "Sasha Argov",
            "City": "Ra'anana",
            "Latitude": 32.1927259,
            "Longitude": 34.8630139,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "HaPalmach 2 - City Sports Hall",
            "Address": "HaPalmach 2 Municipal Sports Hall",
            "City": "Ra'anana",
            "Latitude": 32.1893923,
            "Longitude": 34.8761244,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "HaPerachim",
            "Address": "HaPerahim 21",
            "City": "Ra'anana",
            "Latitude": 32.1808387,
            "Longitude": 34.8540527,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ra’anana Park Northern Parking Lot",
            "Address": "Derech Yerushalayim 7",
            "City": "Ra'anana",
            "Latitude": 32.187479,
            "Longitude": 34.852383,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Etzion 48 - Music Center",
            "Address": "Etzion 48",
            "City": "Ra'anana",
            "Latitude": 32.18638,
            "Longitude": 34.85984,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "2227 Malha - HaDishon-Patria",
            "Address": "HaDishon - Petrya",
            "City": "Jerusalem",
            "Latitude": 31.754282,
            "Longitude": 35.1827655,
            "Operator": "SonolEvi",
            "Duplicate Count": 10.0
        },
        {
            "Station Name": "2225 Beit Vagan - Shachrai",
            "Address": "Shacharai Moradot Beit VeGan",
            "City": "Jerusalem",
            "Latitude": 31.767929,
            "Longitude": 35.187102,
            "Operator": "SonolEvi",
            "Duplicate Count": 10.0
        },
        {
            "Station Name": "Ariel University Upper Campus",
            "Address": "Highway 33",
            "City": "Ariel",
            "Latitude": 32.104616,
            "Longitude": 35.21195,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Lower Campus Opposite Building 60",
            "Address": "Ariel University",
            "City": "Ariel",
            "Latitude": 32.1037016,
            "Longitude": 35.2039403,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Rasko Center",
            "Address": "Atzmon 20",
            "City": "Nof HaGalil",
            "Latitude": 32.7078263,
            "Longitude": 35.3239125,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Lower Dormitory Building",
            "Address": "Ariel University",
            "City": "Ariel",
            "Latitude": 32.106715,
            "Longitude": 35.206645,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Jordan Valley - Milken School",
            "Address": "Tzahal 18",
            "City": "Ariel",
            "Latitude": 32.106243,
            "Longitude": 35.185821,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Galei Kinneret Hotel, Tiberias",
            "Address": "Eliezer Kaplan Boulevard 1 Tiberias Israel",
            "City": "Tiberias",
            "Latitude": 33.818799,
            "Longitude": 35.491598,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Zionism Street - Center LeLe",
            "Address": "Derech HaTzionut 21",
            "City": "Ariel",
            "Latitude": 32.108697,
            "Longitude": 35.185976,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Passage Between Nehoshtim Way and HaPisga",
            "Address": "HaPisga",
            "City": "Ariel",
            "Latitude": 32.106842,
            "Longitude": 35.180092,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sonol Pardes Hanna",
            "Address": "Pardes Hana",
            "City": "Pardes Hanna",
            "Latitude": 32.462981,
            "Longitude": 34.96712,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Vehicle Offices - Yagur",
            "Address": "Derech Shomer HaMesilah",
            "City": "Yagur",
            "Latitude": 32.742386,
            "Longitude": 35.078671,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Shopping Center Parking",
            "Address": "Ashdot Yaakov Meuchad",
            "City": "Ashdot Ya'akov Ihud",
            "Latitude": 32.664808,
            "Longitude": 35.582769,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Sonol Safed",
            "Address": "Birya Junction",
            "City": "Safed",
            "Latitude": 32.974514,
            "Longitude": 35.50383,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Rosh HaNikra",
            "Address": "Rosh HaNikra",
            "City": "Rosh HaNikra",
            "Latitude": 33.08609,
            "Longitude": 35.113455,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "HaCarmel 23",
            "Address": "HaCarmel 23",
            "City": "Rishon Lezion",
            "Latitude": 31.961982,
            "Longitude": 34.804133,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sonol Afula",
            "Address": "Sonol Emek Junction",
            "City": "Afula",
            "Latitude": 32.6038844,
            "Longitude": 35.2811504,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sonol Ein Bokek",
            "Address": "Sonol Ein Bokek",
            "City": "Ein Bokek",
            "Latitude": 31.2029375,
            "Longitude": 35.3591875,
            "Operator": "SonolEvi",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Oscar Commercial Center, Haifa",
            "Address": "Chaim Hazaz 5",
            "City": "Haifa",
            "Latitude": 32.767467,
            "Longitude": 35.0132431,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Sonol Almog",
            "Address": "Sonol Almog",
            "City": "Sonol Almag",
            "Latitude": 31.800981,
            "Longitude": 35.452783,
            "Operator": "SonolEvi",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Idan HaNegev",
            "Address": "Idan HaNegev",
            "City": "Idan HaNegev",
            "Latitude": 31.3771635,
            "Longitude": 34.7838588,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Hadarim Neighborhood - Shoham Local Council",
            "Address": "HaEtrog",
            "City": "Shoham",
            "Latitude": 31.9866415,
            "Longitude": 34.9430183,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Givat Bar - Columbus Parking Lot",
            "Address": "Giv’ot Bar",
            "City": "Gva'ot Bar",
            "Latitude": 31.354404,
            "Longitude": 34.76123,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dudaim Factory - Sorting Plant Parking",
            "Address": "Dudaim Plant",
            "City": "Dudaim Plant",
            "Latitude": 31.315475,
            "Longitude": 34.729553,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kibbutz Shoval - Mevo’ot HaNegev Parking",
            "Address": "Kibbutz Shoval",
            "City": "Kibbutz Shoval",
            "Latitude": 31.413401,
            "Longitude": 34.740044,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Gan HaHevel",
            "Address": "HaHevel 2",
            "City": "Shoham",
            "Latitude": 32.003561,
            "Longitude": 34.944589,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Bnei Shimon Council Parking",
            "Address": "Bnei Shimon",
            "City": "Bnei Shimon",
            "Latitude": 31.4420556,
            "Longitude": 34.7612632,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Joe Alon - Parking",
            "Address": "Joe Alon Visitor Center",
            "City": "Kibbutz Joe Alon",
            "Latitude": 31.3790507,
            "Longitude": 34.8652243,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kramim Garden - Shoham",
            "Address": "Zemora 21",
            "City": "Shoham",
            "Latitude": 32.008072,
            "Longitude": 34.950878,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Beit Kama - Secretariat Parking",
            "Address": "Beit Kama",
            "City": "Beit Kama",
            "Latitude": 31.4466443,
            "Longitude": 34.7634023,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "21101 Menora Parking - Level -4",
            "Address": "Menorah 3",
            "City": "Jerusalem",
            "Latitude": 31.7801433,
            "Longitude": 35.2128143,
            "Operator": "SonolEvi",
            "Duplicate Count": 24.0
        },
        {
            "Station Name": "21100 Safra Parking - Level -5",
            "Address": "Shivtei Yisrael 7",
            "City": "Jerusalem",
            "Latitude": 31.7801089,
            "Longitude": 35.2247419,
            "Operator": "SonolEvi",
            "Duplicate Count": 24.0
        },
        {
            "Station Name": "Country Club Parking",
            "Address": "Uri Tzvi Greenberg",
            "City": "Gan Yavne",
            "Latitude": 31.791916,
            "Longitude": 34.698255,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Iris Center",
            "Address": "Iris 8",
            "City": "Gan Yavne",
            "Latitude": 31.7775765,
            "Longitude": 34.7085706,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Azrieli Town",
            "Address": "Derech Menachem Begin 146",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.0783142,
            "Longitude": 34.7942872,
            "Operator": "SonolEvi",
            "Duplicate Count": 15.0
        },
        {
            "Station Name": "Maccabim Center",
            "Address": "Hashmonaim 3",
            "City": "Gan Yavne",
            "Latitude": 31.783216,
            "Longitude": 34.6915516,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ehad Ha’Am Parking",
            "Address": "Echad Ha’am 11",
            "City": "Gan Yavne",
            "Latitude": 31.7963339,
            "Longitude": 34.703598,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Canada House Parking Lot",
            "Address": "HaMeginim",
            "City": "Gan Yavne",
            "Latitude": 31.792457,
            "Longitude": 34.709347,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Country Club Ariel",
            "Address": "Ariel",
            "City": "Ariel",
            "Latitude": 32.1045956,
            "Longitude": 35.1949429,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Beit Nir - Southern Transformer Room",
            "Address": "Beit Nir",
            "City": "Beit Nir",
            "Latitude": 31.647627,
            "Longitude": 34.873107,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Beit Nir - Near Announcement System",
            "Address": "Beit Nir",
            "City": "Beit Nir",
            "Latitude": 31.6484922,
            "Longitude": 34.871383,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kfar Yehoshua",
            "Address": "Kfar Yehoshua",
            "City": "Kfar Yehoshua",
            "Latitude": 32.6801268,
            "Longitude": 35.1520981,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Habama Center Parking Lot",
            "Address": "Simtat Tzalon 32",
            "City": "Ganei Tikva",
            "Latitude": 32.0592628,
            "Longitude": 34.880456,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "C Parking Lot - Near the Promenade",
            "Address": "Achei Dakar 1",
            "City": "Rishon Lezion",
            "Latitude": 31.997551,
            "Longitude": 34.7336234,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Negev Center Parking - HaTzofim",
            "Address": "HaNegev 9",
            "City": "G",
            "Latitude": 32.0616928,
            "Longitude": 34.8772141,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Rishonim Center",
            "Address": "HaNachshol 79",
            "City": NaN,
            "Latitude": 31.983859,
            "Longitude": 34.78247,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "HaTzofim New Parking Lot",
            "Address": "Derech HaMeshi 21",
            "City": "Gan Yavne",
            "Latitude": 32.066638,
            "Longitude": 34.8676198,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Amirim School",
            "Address": "Derech HaMeshi 9",
            "City": "Gan Yavne",
            "Latitude": 32.0629845,
            "Longitude": 34.8672812,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Bnei Akiva Parking Lot",
            "Address": "Har Nevo 2",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.061237,
            "Longitude": 34.8741845,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Galim Country Club Parking Lot",
            "Address": "HaCarmel 1",
            "City": "Gan Yavne",
            "Latitude": 32.06188,
            "Longitude": 34.8818821,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "HaSahlav Street",
            "Address": "HaSachlav 11",
            "City": "Gan Yavne",
            "Latitude": 31.9706427,
            "Longitude": 34.7851092,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Barshavsky Parking Lot",
            "Address": "Barashvsky 21",
            "City": "Gan Yavne",
            "Latitude": 31.973391,
            "Longitude": 34.812021,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Jordan Valley Street - Opposite Biological Pools",
            "Address": "Jordan Valley 25",
            "City": "Ariel",
            "Latitude": 32.0630417,
            "Longitude": 34.8713036,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Rear Parking Lot - Leader Center",
            "Address": "HaGalil 33",
            "City": "Beit Nir",
            "Latitude": 32.0564842,
            "Longitude": 34.8765221,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Katariel",
            "Address": "Rappaport 4-6",
            "City": "Beit Nir",
            "Latitude": 31.967364,
            "Longitude": 34.824036,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Eastern Parking Lot",
            "Address": "Kibbutz Mizra",
            "City": "Kfar Yehoshua",
            "Latitude": 32.6476601,
            "Longitude": 35.2860507,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Switchboard B",
            "Address": "Kibbutz Mizra",
            "City": "Ganei Tikva",
            "Latitude": 32.6496763,
            "Longitude": 35.2826286,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Clinics",
            "Address": "Kibbutz Mizra",
            "City": "Rishon Lezion",
            "Latitude": 32.6518641,
            "Longitude": 35.2860444,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ma’aleh Yitzhak",
            "Address": "Ma’ale Yitzhak 23",
            "City": "Ganei Tikva",
            "Latitude": 32.7022064,
            "Longitude": 35.3224533,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "NoPark Nof HaGalil",
            "Address": "Tirosh 8",
            "City": "Rishon Lezion",
            "Latitude": 32.6936841,
            "Longitude": 35.3207273,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ir Yamim",
            "Address": "Bnei Berman 2",
            "City": "Ganei Tikva",
            "Latitude": 32.2791567,
            "Longitude": 34.8470676,
            "Operator": "SonolEvi",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Sonol Kochav Tavor",
            "Address": "Sonol Kochav HaTavor",
            "City": "Ganei Tikva",
            "Latitude": 32.6775,
            "Longitude": 35.4133333,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Yehuda Street - Near Municipality",
            "Address": "Yehuda 12",
            "City": "Ganei Tikva",
            "Latitude": 32.104804,
            "Longitude": 35.171927,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ariel Youth Center",
            "Address": "Derech Nachshonim 31",
            "City": "Ganei Tikva",
            "Latitude": 32.105611,
            "Longitude": 35.173788,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Nehoshtim Way 33",
            "Address": "Derech Nachshonim 33",
            "City": "Rishon Lezion",
            "Latitude": 32.105756,
            "Longitude": 35.173003,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Parking Lot 2 - Mafsalim",
            "Address": "Mefalsim",
            "City": "Rishon Lezion",
            "Latitude": 31.504384,
            "Longitude": 34.562219,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Yakinton 7, Nof HaGalil",
            "Address": "Yekinton 7",
            "City": "Ganei Tikva",
            "Latitude": 32.7245816,
            "Longitude": 35.3362198,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Nof HaGalil - Opposite Plaza Hotel",
            "Address": "Hermon 3",
            "City": "Ganei Tikva",
            "Latitude": 32.7091766,
            "Longitude": 35.3127559,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Nof HaGalil - Municipal Market Parking Lot",
            "Address": "Derech Ariel Sharon 40",
            "City": "Rishon Lezion",
            "Latitude": 32.6933437,
            "Longitude": 35.3062849,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Nof HaGalil - Dalia Park",
            "Address": "Dalia 12",
            "City": "Kibbutz Mizra",
            "Latitude": 32.728035,
            "Longitude": 35.332443,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Mall HaHof Underground Parking - Level -1",
            "Address": "Shikhtman 10",
            "City": "Kibbutz Mizra",
            "Latitude": 32.4409523,
            "Longitude": 34.8931923,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "2206 Givat Massuah - Aryeh Dulchin",
            "Address": "Aryeh Dulchin",
            "City": "Kibbutz Mizra",
            "Latitude": 31.7499275,
            "Longitude": 35.1694834,
            "Operator": "SonolEvi",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "2208 Kiryat Menachem - Columbia",
            "Address": "Colombia",
            "City": "Nof HaGalil",
            "Latitude": 31.758036,
            "Longitude": 35.165363,
            "Operator": "SonolEvi",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "2232 Har Homa - Rabbi Min HaHar",
            "Address": "Harav Min HaHar",
            "City": "Nof HaGalil",
            "Latitude": 31.722803,
            "Longitude": 35.226865,
            "Operator": "SonolEvi",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Sonol Sde Amudim",
            "Address": "Sonol Sde Amudim",
            "City": "Netanya",
            "Latitude": 32.8206572,
            "Longitude": 35.4075211,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Talmud Torah - Ganei Tikva",
            "Address": "HaTavor 12",
            "City": "Kfar Tavor",
            "Latitude": 32.059461,
            "Longitude": 34.86747,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "HaTamar 5, Shoham",
            "Address": "HaTamar 5",
            "City": "Ariel",
            "Latitude": 31.9887514,
            "Longitude": 34.9437784,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Noga Square, Shoham",
            "Address": "Rechavat Noga",
            "City": "Ariel",
            "Latitude": 32.0037502,
            "Longitude": 34.9466766,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Travelers’ Village Hotel - Sde Nehemia",
            "Address": "Sde Nehemia",
            "City": "Ariel",
            "Latitude": 33.188234,
            "Longitude": 35.62307,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Eastern Dining Room Parking",
            "Address": "Kibbutz Afik",
            "City": "Miflasim",
            "Latitude": 32.779428,
            "Longitude": 35.702994,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Kibbutz Sde Nachum",
            "Address": "Sde Nahum",
            "City": "Nof HaGalil",
            "Latitude": 32.5262489,
            "Longitude": 35.4797897,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sonol Tamra",
            "Address": "Sonol Tamra",
            "City": "Nof HaGalil",
            "Latitude": 32.8624533,
            "Longitude": 35.1707768,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Opposite Zichron",
            "Address": "Western Industrial Area",
            "City": "Nof HaGalil",
            "Latitude": 32.56879,
            "Longitude": 34.933523,
            "Operator": "SonolEvi",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Kibbutz Gezer",
            "Address": "Kibbutz Gezer",
            "City": "Nof HaGalil",
            "Latitude": 31.876349,
            "Longitude": 34.92111,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Western Neighborhood Parking",
            "Address": "Kibbutz Gevat Western Neighborhood Parking Lot",
            "City": "Hadera",
            "Latitude": 32.6769396,
            "Longitude": 35.2103255,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "2110 French Hill - Community Center Manager",
            "Address": "Bar Kochva",
            "City": "Jerusalem",
            "Latitude": 31.8050209,
            "Longitude": 35.2387566,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Cold Storage Parking (Pool)",
            "Address": "Kibbutz Nitzanim",
            "City": "Jerusalem",
            "Latitude": 31.7169017,
            "Longitude": 34.63548,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Upper Seam Line Parking (Extension)",
            "Address": "Kibbutz Nitzanim",
            "City": "Jerusalem",
            "Latitude": 31.719012,
            "Longitude": 34.6359546,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ra’anana - Moshe Wilensky 15",
            "Address": "Moshe Vilensky 15",
            "City": "Sde Amudim",
            "Latitude": 32.194522,
            "Longitude": 34.86873,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Secretariat Parking - Shilat",
            "Address": "Shilat",
            "City": "Ganei Tikva",
            "Latitude": 31.91773,
            "Longitude": 35.0187093,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Parking",
            "Address": "Ya'ara 27A",
            "City": "Shoham",
            "Latitude": 32.1841102,
            "Longitude": 34.8870578,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Temporary Settlement - Shilat",
            "Address": "Shilat",
            "City": "Shoham",
            "Latitude": 31.919403,
            "Longitude": 35.0238436,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Lake Parking Lot",
            "Address": "Derech HaPark 1",
            "City": "Sde Nehemia",
            "Latitude": 32.18797,
            "Longitude": 34.846706,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kerem Darom Parking Lot",
            "Address": "Keren Darom Parking Lot",
            "City": "Kibbutz Afik",
            "Latitude": 32.6733385,
            "Longitude": 35.2114398,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ashstrom Parking Lot",
            "Address": "Ashtrom Parking Lot",
            "City": "Sde Nahum",
            "Latitude": 32.6737546,
            "Longitude": 35.2119903,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kolbo Parking Lot",
            "Address": "Kibbutz Gevat, Kolbo Parking Lot",
            "City": "Tamra",
            "Latitude": 32.6759529,
            "Longitude": 35.2125549,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Nof HaGalil Stadium",
            "Address": "Tirosh",
            "City": "Zichron Yaakov",
            "Latitude": 32.689155,
            "Longitude": 35.31053,
            "Operator": "SonolEvi",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Kfar HaNokdim",
            "Address": "Kfar Nokdim",
            "City": "Kibbutz Gezer",
            "Latitude": 31.305785,
            "Longitude": 35.269544,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ra’anana Country Club",
            "Address": "HaSadna 15",
            "City": "Kibbutz Gevat",
            "Latitude": 32.193907,
            "Longitude": 34.8789266,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Opposite Zichron - Fast Charger",
            "Address": "Western Industrial Area",
            "City": "Jerusalem",
            "Latitude": 32.56994,
            "Longitude": 34.934183,
            "Operator": "SonolEvi",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Municipal Pool Parking Lot",
            "Address": "Yair 3",
            "City": "Kibbutz Nitzanim",
            "Latitude": 32.192251,
            "Longitude": 34.8471324,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Azrieli Rishonim Train Station Parking",
            "Address": "Sderot Nim 1",
            "City": "Kibbutz Nitzanim",
            "Latitude": 31.9491558,
            "Longitude": 34.8042793,
            "Operator": "SonolEvi",
            "Duplicate Count": 10.0
        },
        {
            "Station Name": "Sonol Migdal HaEmek",
            "Address": "Tzalmon 2",
            "City": "Ra'anana",
            "Latitude": 32.6737034,
            "Longitude": 35.2504955,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Lake House Hotel, Tiberias",
            "Address": "Derech HaMerchatzot",
            "City": "Shilat",
            "Latitude": 32.77079,
            "Longitude": 35.5468641,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Center Park Hadera",
            "Address": "Gamla 3",
            "City": "Ra'anana",
            "Latitude": 32.4275593,
            "Longitude": 34.9328599,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sonol Regba",
            "Address": "Sonol Regba",
            "City": "Shilat",
            "Latitude": 32.9777802,
            "Longitude": 35.0943286,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Sonol Na’aman Junction",
            "Address": "Misraq Junction",
            "City": "Ra'anana",
            "Latitude": 32.887351,
            "Longitude": 35.094415,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Eucalyptus Parking Lot - Gazit",
            "Address": "Kibbutz Gazit",
            "City": "Kibbutz Gevat",
            "Latitude": 32.6396216,
            "Longitude": 35.4483855,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Sha’ar HaTzafon Mall",
            "Address": "Derech Haifa 30",
            "City": "Kibbutz Gevat",
            "Latitude": 32.807148,
            "Longitude": 35.076336,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gazit Secretariat Parking Lot",
            "Address": "Kibbutz Gazit",
            "City": "Kibbutz Gevat",
            "Latitude": 32.6376963,
            "Longitude": 35.4468086,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "2213 Ramat Sharett - Rabbi Rahamim Naehuri",
            "Address": "Kadish Luz",
            "City": "Nof HaGalil",
            "Latitude": 31.7659709,
            "Longitude": 35.1821296,
            "Operator": "SonolEvi",
            "Duplicate Count": 10.0
        },
        {
            "Station Name": "Parking - Institutional Building",
            "Address": "Kibbutz Dalia",
            "City": "Kfar Nokdim",
            "Latitude": 32.5908795,
            "Longitude": 35.0757766,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "2223 Kiryat Yovel - Torah and Work",
            "Address": "Torah VaAvoda 1",
            "City": "Ra'anana",
            "Latitude": 31.767042,
            "Longitude": 35.180332,
            "Operator": "SonolEvi",
            "Duplicate Count": 10.0
        },
        {
            "Station Name": "2122 Malha - Pais Arena",
            "Address": "Elmalich 1",
            "City": "Zichron Yaakov",
            "Latitude": 31.7523451,
            "Longitude": 35.1929701,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "2124 Supreme Court",
            "Address": "Sha'ar Mishpat",
            "City": "Ra'anana",
            "Latitude": 31.781742,
            "Longitude": 35.204985,
            "Operator": "SonolEvi",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "HaShizaf 10 - Urban Aesthetics Wing",
            "Address": "HaShizaf 10",
            "City": "Rishon Lezion",
            "Latitude": 32.1932586,
            "Longitude": 34.8859298,
            "Operator": "SonolEvi",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Sonol Beit She’an",
            "Address": "HaAmal 10",
            "City": "Migdal HaEmek",
            "Latitude": 32.511053,
            "Longitude": 35.5007623,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Soleil Hotel, Eilat",
            "Address": "Tarshish 12",
            "City": "Tiberias",
            "Latitude": 29.5515233,
            "Longitude": 34.956643,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ein Harod Ichud",
            "Address": "Ein Harod Meuchad",
            "City": "Hadera",
            "Latitude": 32.562542,
            "Longitude": 35.395031,
            "Operator": "SonolEvi",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Parking Lot 3.5 Levels",
            "Address": "Mefalsim",
            "City": "Moshav Regba",
            "Latitude": 31.502997,
            "Longitude": 34.559416,
            "Operator": "SonolEvi",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "David Intercontinental",
            "Address": "12 Kaufman",
            "City": "Kfar Masaryk",
            "Latitude": 32.065309,
            "Longitude": 34.763948,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Dor Alon - Zichron Yaakov",
            "Address": "Dor Alon - Zichron Yaakov",
            "City": "Kibbutz Gazit",
            "Latitude": 32.569519,
            "Longitude": 34.9361718,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Afcon Parking",
            "Address": "Simtat HaTavor 4",
            "City": "Kiryat Ata",
            "Latitude": 32.10924,
            "Longitude": 34.887414,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Machanayim Junction",
            "Address": "Machanayim Junction 1",
            "City": "Kibbutz Gazit",
            "Latitude": 32.990315,
            "Longitude": 35.562901,
            "Operator": "AfconEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Zukim Dor-Alon",
            "Address": "Tzukim 1",
            "City": "Jerusalem",
            "Latitude": 30.485072,
            "Longitude": 35.173513,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "BIG Eilat - HaSetet 20, Eilat",
            "Address": "HaSetet 20",
            "City": "Kibbutz Dalia",
            "Latitude": 29.565645,
            "Longitude": 34.960612,
            "Operator": "AfconEv",
            "Duplicate Count": 7.0
        },
        {
            "Station Name": "BIG Yokneam",
            "Address": "Sderot Rabin 9",
            "City": "Jerusalem",
            "Latitude": 32.6435558,
            "Longitude": 35.092255,
            "Operator": "AfconEv",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "BIG Kastina - Area 1",
            "Address": "Bnei Toviah Industrial Zone",
            "City": "Jerusalem",
            "Latitude": 31.727778,
            "Longitude": 34.754722,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "BIG Poriya Tiberias Parking",
            "Address": "HaMivreg 1",
            "City": "Jerusalem",
            "Latitude": 32.7844506,
            "Longitude": 35.4983293,
            "Operator": "AfconEv",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Emek Hefer - HaShita",
            "Address": "Emek Hefer HaShita",
            "City": "Ra'anana",
            "Latitude": 32.397353,
            "Longitude": 34.895367,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Emek Hefer - HaBatzir",
            "Address": "HaBatzir Corner HaMesik",
            "City": "Beit She'an",
            "Latitude": 32.403223,
            "Longitude": 34.893823,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "BIG Fashion Ashdod - Covered Parking",
            "Address": "Derech HaRakevet 1",
            "City": "Eilat",
            "Latitude": 31.77642,
            "Longitude": 34.664153,
            "Operator": "AfconEv",
            "Duplicate Count": 7.0
        },
        {
            "Station Name": "BIG Kiryat Shmona",
            "Address": "Southern Industrial Zone",
            "City": "Ein Harod Ihud",
            "Latitude": 33.19292,
            "Longitude": 35.570308,
            "Operator": "AfconEv",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Olive Gilboa Hotel Parking",
            "Address": "Ski Site - Gilboa Scenic Route - Ta’anakhim Highway",
            "City": "Miflasim",
            "Latitude": 32.552548,
            "Longitude": 35.333799,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Paz Migdal HaEmek",
            "Address": "Sderot Shaul Amor",
            "City": "Tel Aviv",
            "Latitude": 32.684383,
            "Longitude": 35.247697,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Emek Hefer - Em HaDerech Mall",
            "Address": "Kanyon Em HaDerech",
            "City": "Zichron Yaakov",
            "Latitude": 32.383346,
            "Longitude": 34.867096,
            "Operator": "AfconEv",
            "Duplicate Count": 11.0
        },
        {
            "Station Name": "Emek Hefer Council Building",
            "Address": "Regional Council Emek Hefer",
            "City": "Petah Tikva",
            "Latitude": 32.343939,
            "Longitude": 34.910331,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Bat Hefer Commercial Center",
            "Address": "Bet Hekht Mall",
            "City": "Tzomet Machanayim",
            "Latitude": 32.33515,
            "Longitude": 35.01305,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kfar Vitkin, Emek Hefer",
            "Address": "Kfar Vitkin",
            "City": "Tzukim",
            "Latitude": 32.380499,
            "Longitude": 34.87367,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Yikon, Emek Hefer",
            "Address": "Yakum",
            "City": "Eilat",
            "Latitude": 32.359612,
            "Longitude": 34.991567,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "BIG Kiryat Ata - Area 1",
            "Address": "Sderot HaHistadrut 248",
            "City": "Yokneam Illit",
            "Latitude": 32.809989,
            "Longitude": 35.072325,
            "Operator": "AfconEv",
            "Duplicate Count": 9.0
        },
        {
            "Station Name": "BIG Fashion Tiberias Parking - Level -1",
            "Address": "Yehuda HaLevi 1",
            "City": "Be'er Tuvia",
            "Latitude": 32.7908496,
            "Longitude": 35.5337059,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kedem Pool, Emek Hefer",
            "Address": "Simtat HaGefen",
            "City": "Tiberias",
            "Latitude": 32.3325768,
            "Longitude": 34.9683046,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Hofit, Emek Hefer",
            "Address": "Hofit",
            "City": "Emek Hefer Industrial Park",
            "Latitude": 32.3836403,
            "Longitude": 34.8709776,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "AC - BIG Carmiel",
            "Address": "Ma'ale Kamon",
            "City": "Emek Hefer Industrial Zone",
            "Latitude": 32.9277471,
            "Longitude": 35.3216878,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Parking Lot B, BIG Fashion Nazareth",
            "Address": "53 Tawfiq Ziad",
            "City": "Ashdod",
            "Latitude": 32.6952517,
            "Longitude": 35.2999846,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Emek Hefer - Beit Rishonim Parking",
            "Address": "Beit HaRishonim 5",
            "City": "Kiryat Shmona",
            "Latitude": 32.403089,
            "Longitude": 34.89869,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "BIG Fashion Yarka (near McDonald's)",
            "Address": "Yarka",
            "City": "Nurit",
            "Latitude": 32.956508,
            "Longitude": 35.182331,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "BIG Regba",
            "Address": "Regba",
            "City": "Migdal HaEmek",
            "Latitude": 32.975134,
            "Longitude": 35.093887,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "BIG Fashion Beit Shemesh",
            "Address": "Yigal Alon 1",
            "City": "Emek Hefer Regional Council",
            "Latitude": 31.7568649,
            "Longitude": 34.9896734,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Yemin Orde - Caravans",
            "Address": "Caravans",
            "City": "Emek Hefer Regional Council",
            "Latitude": 32.7038049,
            "Longitude": 34.9851652,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Yemin Orde - Cultural Center",
            "Address": "Cultural Center",
            "City": "Bat Hefer",
            "Latitude": 32.7014549,
            "Longitude": 34.9878443,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ofek Mall",
            "Address": "Trompeldor Beach 39",
            "City": "Kfar Vitkin",
            "Latitude": 32.0025326,
            "Longitude": 34.8343757,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "The Municipality",
            "Address": "HaGdud HaIvri 10",
            "City": "Emek Hefer Regional Council",
            "Latitude": 31.7921646,
            "Longitude": 34.6379829,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Center - Petah Tikva (Upper Level) (Y) Yachin",
            "Address": "Shaham 17",
            "City": "Kiryat Ata",
            "Latitude": 32.0881948,
            "Longitude": 34.8597747,
            "Operator": "AfconEv",
            "Duplicate Count": 12.0
        },
        {
            "Station Name": "Center - Netanya (Upper Level) (Y) Yachin",
            "Address": "Sderot Giborei Yisrael 17",
            "City": "Tiberias",
            "Latitude": 32.2820685,
            "Longitude": 34.8625755,
            "Operator": "AfconEv",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "HaEshel 1",
            "Address": "HaEshkol 1",
            "City": "Burgata",
            "Latitude": 32.477509,
            "Longitude": 34.94475,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Botanica Hotel (Hotel Guests Only)",
            "Address": "Derech Allenby 65",
            "City": "Hofit",
            "Latitude": 32.8184471,
            "Longitude": 34.9887892,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Karnei Shomron - Neve Menachem Parking",
            "Address": "HaGitit 8",
            "City": "Karmiel",
            "Latitude": 32.173906,
            "Longitude": 35.10824,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Karnei Shomron - Lapidim Parking",
            "Address": "Sderot Rehavam 1",
            "City": "Nazareth",
            "Latitude": 32.174121,
            "Longitude": 35.0910259,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "BIG Check Post Haifa",
            "Address": "Israel Bar Yehuda 111",
            "City": "Emek Hefer Industrial Park",
            "Latitude": 32.786599,
            "Longitude": 35.03033,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "BIG Kiryat Gat",
            "Address": "Derech HaDarom 3",
            "City": "Yarka",
            "Latitude": 31.6029928,
            "Longitude": 34.7716471,
            "Operator": "AfconEv",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "BIG Beit Shemesh",
            "Address": "Yigal Alon 1",
            "City": "Regba",
            "Latitude": 31.756347,
            "Longitude": 34.986789,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Lubinski Complex - Be’er Sheva",
            "Address": "Tozeret HaAretz 1",
            "City": "Beit Shemesh",
            "Latitude": 31.220033,
            "Longitude": 34.803593,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Carmey Avdat Farm",
            "Address": "Carmey Avdat Farm",
            "City": "Yemin Orde",
            "Latitude": 30.825831,
            "Longitude": 34.739241,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Emek Hefer - Beit Yanai",
            "Address": "Bitness",
            "City": "Yemin Orde",
            "Latitude": 32.361421,
            "Longitude": 34.868886,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "BIG Pardes Hana-Karkur",
            "Address": "BIG Pardes Hana Karkur",
            "City": "Pardes Hanna-Karkur",
            "Latitude": 32.488873,
            "Longitude": 34.969849,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Municipal Employees’ Parking - Ashdod (Authorized Only)",
            "Address": "Zabotinsky 88 10",
            "City": "Ashdod",
            "Latitude": 31.8062352,
            "Longitude": 34.660058,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ein Harod Meuhad Secretariat",
            "Address": "Kibbutz Ein Harod Meuchad",
            "City": "Kibbutz Ein Harod Ihud",
            "Latitude": 32.5581711,
            "Longitude": 35.392213,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "BIG Afula",
            "Address": "BIG Afula",
            "City": "Afula",
            "Latitude": 32.6056714,
            "Longitude": 35.2929956,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Bar-Lev High-Tech Park",
            "Address": "HaDolev 3",
            "City": "Bar Lev Industrial Park",
            "Latitude": 32.9050527,
            "Longitude": 35.1881171,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Cinema City - Glilot",
            "Address": "Cinema City - Glilot",
            "City": "Ramat Hasharon",
            "Latitude": 32.147055,
            "Longitude": 34.807337,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "BIG Eilat - HaOman 11, Eilat",
            "Address": "HaOman 11",
            "City": "Eilat",
            "Latitude": 29.5652687,
            "Longitude": 34.9586955,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Gush Etzion Regional Council Parking",
            "Address": "Regional Council Gush Etzion",
            "City": "Gush Etzion Regional Council",
            "Latitude": 31.6581869,
            "Longitude": 35.1178006,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "First President 54 - Weizmann Institute",
            "Address": "HaNasi HaRishon 54",
            "City": "Rehovot",
            "Latitude": 31.904633,
            "Longitude": 34.816461,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dor Alon - Mesubim Junction Station",
            "Address": "Highway 4 Corner 461",
            "City": "Ramat Gan",
            "Latitude": 32.0380559,
            "Longitude": 34.8307276,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Halamish 14, Caesarea",
            "Address": "Halamit 14",
            "City": "Caesarea",
            "Latitude": 32.4847776,
            "Longitude": 34.94848,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Nachsholim Beach",
            "Address": "Hof Neurim",
            "City": "Emek Hefer Regional Council",
            "Latitude": 32.3650133,
            "Longitude": 34.8588268,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Beit Yitzhak - Country Club",
            "Address": "Beit Yitzhak",
            "City": "Emek Hefer Regional Council",
            "Latitude": 32.3282876,
            "Longitude": 34.8979503,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Valley of Springs - Neve Eitan",
            "Address": "Neve Eitan School",
            "City": "Beit She'an",
            "Latitude": 32.4923525,
            "Longitude": 35.5280976,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Shopina, Rosh Pina",
            "Address": "HaTapuach 3",
            "City": "Rosh Pina",
            "Latitude": 32.970419,
            "Longitude": 35.5503661,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sonol Sde Ilan",
            "Address": "Sde Ilan Junction",
            "City": "Sde Ilan",
            "Latitude": 32.75288,
            "Longitude": 35.411482,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Dor Alon - Beit HaShita",
            "Address": "Highway 71 Beit HaShita",
            "City": "Beit Hashita",
            "Latitude": 32.5442376,
            "Longitude": 35.4339864,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "BIG Be’er Sheva",
            "Address": "Sderot Eliyahu Nawi 18",
            "City": "Be'er Sheva",
            "Latitude": 31.241632,
            "Longitude": 34.8123045,
            "Operator": "AfconEv",
            "Duplicate Count": 7.0
        },
        {
            "Station Name": "Holon Yamit 2000",
            "Address": "Yamit 2000 Parking Lot 58",
            "City": "Holon",
            "Latitude": 32.003659,
            "Longitude": 34.793052,
            "Operator": "AfconEv",
            "Duplicate Count": 10.0
        },
        {
            "Station Name": "Holon Peres Park",
            "Address": "Park Peres 58",
            "City": "Holon",
            "Latitude": 32.003352,
            "Longitude": 34.799301,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "The Kadion",
            "Address": "Sderot Yitzhak Ben Tzvi 73",
            "City": "Kadima-Tzoran",
            "Latitude": 32.2732085,
            "Longitude": 34.9111291,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Akirov Towers - Authorized Only",
            "Address": "Pincus 64",
            "City": "Tel Aviv",
            "Latitude": 32.0909475,
            "Longitude": 34.7932715,
            "Operator": "AfconEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "David Center",
            "Address": "HaNesi’im 1",
            "City": "Hod Hasharon",
            "Latitude": 32.1629988,
            "Longitude": 34.909461,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Dor Alon - Yakum",
            "Address": "Dor Alon - Yakum",
            "City": "Yakum",
            "Latitude": 32.248343,
            "Longitude": 34.835809,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Lubinski Complex - Sorek",
            "Address": "Mark Moshowitz 3",
            "City": "Rishon Lezion",
            "Latitude": 31.951798,
            "Longitude": 34.769046,
            "Operator": "AfconEv",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Dan Hotels - Carmel",
            "Address": "HaNasi 85",
            "City": "Haifa",
            "Latitude": 32.809887,
            "Longitude": 34.985046,
            "Operator": "AfconEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Dan Hotels - Link Tel Aviv",
            "Address": "Dafna 8",
            "City": "Tel Aviv",
            "Latitude": 32.078319,
            "Longitude": 34.7903512,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Menachem Begin 11, Gedera",
            "Address": "Menachem Begin 11",
            "City": "Gedera",
            "Latitude": 31.8005122,
            "Longitude": 34.7831768,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dan Hotels - Dan Tel Aviv Hotel",
            "Address": "HaYarkon 99",
            "City": "Tel Aviv",
            "Latitude": 32.0798106,
            "Longitude": 34.7679504,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Menachem Begin 31, Gedera",
            "Address": "Menachem Begin 31",
            "City": "Gedera",
            "Latitude": 31.804721,
            "Longitude": 34.784375,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Dan Hotels - Dan Panorama Hotel",
            "Address": "Professor Yitzhak Kaufman 10",
            "City": "Tel Aviv",
            "Latitude": 32.0648873,
            "Longitude": 34.7629581,
            "Operator": "AfconEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Dan Hotels - King David Hotel, Jerusalem",
            "Address": "David HaMelech 23",
            "City": "Jerusalem",
            "Latitude": 31.7737167,
            "Longitude": 35.2224132,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dan Hotels - Dan Eilat Hotel",
            "Address": "HaYam 5",
            "City": "Eilat",
            "Latitude": 29.5489783,
            "Longitude": 34.9653036,
            "Operator": "AfconEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Menachem Begin 53, Gedera",
            "Address": "Menachem Begin 53",
            "City": "Gedera",
            "Latitude": 31.807586,
            "Longitude": 34.785834,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ofek Center (Gedera Community Center), Kanfei Nesharim, Gedera",
            "Address": "Ofek Center (Matnas Gedera) Kanfei Nesharim 4 Gedera",
            "City": "Gedera",
            "Latitude": 31.809867,
            "Longitude": 34.779011,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Erez Street 17, Gedera",
            "Address": "Erez Street 17",
            "City": "Gedera",
            "Latitude": 31.802588,
            "Longitude": 34.786998,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Petach She’an",
            "Address": "Sha'an Regional Industries",
            "City": "Beit She'an",
            "Latitude": 32.4945357,
            "Longitude": 35.5203512,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Shekevitz Street 2, Gedera",
            "Address": "Shekevitz 2",
            "City": "Gedera",
            "Latitude": 31.815008,
            "Longitude": 34.775279,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "HaBiluim Street 19, Gedera",
            "Address": "HaBiluim 19",
            "City": "Gedera",
            "Latitude": 31.815167,
            "Longitude": 34.773719,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dan Hotels - Panorama Jerusalem Hotel (Hotel Guests Only)",
            "Address": "Keren HaYesod 39",
            "City": "Jerusalem",
            "Latitude": 31.77291,
            "Longitude": 35.22156,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Local Council Parking, Gedera",
            "Address": "Local Council Parking Lot Gedera 4",
            "City": "Gedera",
            "Latitude": 31.8159113,
            "Longitude": 34.7773833,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Parking - Derech Eretz Street Entrance, Ashdod",
            "Address": "Derech Eretz Street 10",
            "City": "Ashdod",
            "Latitude": 31.792341,
            "Longitude": 34.635641,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Parking - HaBanim Street Entrance, Ashdod",
            "Address": "HaGdud HaIvri 10",
            "City": "Ashdod",
            "Latitude": 31.7933307,
            "Longitude": 34.6370497,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Level -2",
            "Address": "HaCharash 20",
            "City": "Tel Aviv",
            "Latitude": 32.058481,
            "Longitude": 34.7843509,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Hayozer Complex, Carmiel",
            "Address": "HaYotzrim 7",
            "City": "Karmiel",
            "Latitude": 32.92322,
            "Longitude": 35.307308,
            "Operator": "AfconEv",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Gush Etzion Junction",
            "Address": "Gush Etzion Junction",
            "City": "Gush Etzion",
            "Latitude": 31.644836,
            "Longitude": 35.130714,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Gan HaIr Complex, Carmiel",
            "Address": "HaHaroshet 15",
            "City": "Karmiel",
            "Latitude": 32.921882,
            "Longitude": 35.307172,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Victory Complex, Tirat Carmel",
            "Address": "Keren HaYesod 2",
            "City": "Tirat Carmel",
            "Latitude": 32.768662,
            "Longitude": 34.968682,
            "Operator": "AfconEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "BIG Rishon LeZion",
            "Address": "Plotitzky 2",
            "City": "Rishon Lezion",
            "Latitude": 31.984365,
            "Longitude": 34.812705,
            "Operator": "AfconEv",
            "Duplicate Count": 7.0
        },
        {
            "Station Name": "Sapir College Hydrotherapy Rehabilitation Center",
            "Address": "Sha'ar HaNegev",
            "City": "Sha'ar HaNegev",
            "Latitude": 31.511888,
            "Longitude": 34.596044,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "SouthUp - Sha'ar HaNegev Technological Incubator",
            "Address": "Sha'ar HaNegev",
            "City": "Sha'ar HaNegev",
            "Latitude": 31.514056,
            "Longitude": 34.594396,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dor Alon - Mishmar HaSharon",
            "Address": "Mishmar HaSharon",
            "City": "Mishmar HaSharon",
            "Latitude": 32.358011,
            "Longitude": 34.907919,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Arlozorov 17, Tel Aviv (Authorized Entry Only)",
            "Address": "Arlozorov 17",
            "City": "Tel Aviv",
            "Latitude": 32.0872621,
            "Longitude": 34.7740372,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dor Alon - Mizra",
            "Address": "Dor Alon",
            "City": "Kibbutz Mizra",
            "Latitude": 32.6496941,
            "Longitude": 35.2911532,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Emek Hefer - Ruppin College",
            "Address": "Emek Hefer Regional Council",
            "City": "Emek Hefer Regional Council",
            "Latitude": 32.3418559,
            "Longitude": 34.9112017,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Giv’at Ze’ev Commercial Center",
            "Address": "Highway 4363",
            "City": "Giv'at Ze'ev",
            "Latitude": 31.856829,
            "Longitude": 35.172351,
            "Operator": "AfconEv",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Ofek 1, Caesarea (Authorized Only)",
            "Address": "HaEshkol 2",
            "City": "Caesarea",
            "Latitude": 32.4775649,
            "Longitude": 34.9453635,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Roshit HaMoshava Parking Lot",
            "Address": "Yechiel Habibi",
            "City": "Rehovot",
            "Latitude": 31.896379,
            "Longitude": 34.816167,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "AB Towers, Ziv",
            "Address": "Raoul Wallenberg 24",
            "City": "Tel Aviv",
            "Latitude": 32.1112424,
            "Longitude": 34.83892,
            "Operator": "AfconEv",
            "Duplicate Count": 9.0
        },
        {
            "Station Name": "Gas Station - Sarid Complex",
            "Address": "Gas Station Complex Sarid Junction",
            "City": "Jezreel Valley",
            "Latitude": 32.661435,
            "Longitude": 35.235967,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Alon HaTavor 13",
            "Address": "Alon HaTavor 13",
            "City": "Caesarea",
            "Latitude": 32.476548,
            "Longitude": 34.946839,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Bareket 8",
            "Address": "Barkat 8",
            "City": "Caesarea",
            "Latitude": 32.480119,
            "Longitude": 34.944792,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Bareket 20, Caesarea",
            "Address": "Barkat 20",
            "City": "Caesarea",
            "Latitude": 32.4829064,
            "Longitude": 34.9467108,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Eshel Logistics Center, Caesarea",
            "Address": "Eilat HaMastik 2",
            "City": "Caesarea",
            "Latitude": 32.474211,
            "Longitude": 34.940227,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "HaEshel 40",
            "Address": "HaEshkol 40",
            "City": "Caesarea",
            "Latitude": 32.4708755,
            "Longitude": 34.9448845,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Harduf HaNachalim 16",
            "Address": "HaRaduf HaNeharim 16",
            "City": "Caesarea",
            "Latitude": 32.473398,
            "Longitude": 34.947297,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Granite 10",
            "Address": "Granite 10",
            "City": "Caesarea",
            "Latitude": 32.488521,
            "Longitude": 34.950771,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Golf Club - Members Only",
            "Address": "Rothschild 1",
            "City": "Caesarea",
            "Latitude": 32.501529,
            "Longitude": 34.906321,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Manchat Hinuch 3, Modi’in Illit",
            "Address": "Menahem Chinuch 4",
            "City": "Modi'in Illit",
            "Latitude": 31.931048,
            "Longitude": 35.043465,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "(Golf Club - Open to Public)",
            "Address": "Rothschild 1",
            "City": "Caesarea",
            "Latitude": 32.501686,
            "Longitude": 34.906335,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "HaGra 4, Modi’in Illit",
            "Address": "HaGera 4",
            "City": "Modi'in Illit",
            "Latitude": 31.9240619,
            "Longitude": 35.0507707,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Intergreen 3 Chargers 11-16 (Panel B - Authorized Only)",
            "Address": "Yagiy Kapayim 17",
            "City": "Petah Tikva",
            "Latitude": 32.0979924,
            "Longitude": 34.8556549,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "HaDolev Alley 64",
            "Address": "Simtat HaDolev 64",
            "City": "Caesarea",
            "Latitude": 32.512199,
            "Longitude": 34.903306,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Lashim Industrial Park 6",
            "Address": "Leshem Industrial Park 6",
            "City": "Caesarea",
            "Latitude": 32.4828043,
            "Longitude": 34.9454167,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Shemesh 2",
            "Address": "Shemesh 2",
            "City": "Caesarea",
            "Latitude": 32.48698,
            "Longitude": 34.91265,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Dor Alon - Latrun",
            "Address": "Dor Alon - Latrun",
            "City": "Latroun",
            "Latitude": 31.8370558,
            "Longitude": 34.9769187,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Parking Level",
            "Address": "Building France Europark",
            "City": "Yakum",
            "Latitude": 32.2485115,
            "Longitude": 34.8360619,
            "Operator": "AfconEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "BIG Yehud",
            "Address": "Altalef 4",
            "City": "Yehud",
            "Latitude": 32.025981,
            "Longitude": 34.900558,
            "Operator": "AfconEv",
            "Duplicate Count": 11.0
        },
        {
            "Station Name": "Kfar Yedidia, Emek Hefer",
            "Address": "HaKfar 94",
            "City": "Emek Hefer Regional Council",
            "Latitude": 32.347323,
            "Longitude": 34.898759,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dor Alon - HaOn",
            "Address": "HaOn Junction",
            "City": "Tzomet HaOn",
            "Latitude": 32.721469,
            "Longitude": 35.620681,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Technion - Bloomfield",
            "Address": "3200003",
            "City": "Haifa",
            "Latitude": 32.7736618,
            "Longitude": 35.0250852,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Shlomo 5, Modi’in Illit",
            "Address": "Menahem Shlomo 5",
            "City": "Modi'in Illit",
            "Latitude": 31.925518,
            "Longitude": 35.044719,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Technion - Mathematics Building",
            "Address": "3200003",
            "City": "Haifa",
            "Latitude": 32.7779243,
            "Longitude": 35.0238514,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ash Parking Lot, Ra’anana, Tel Hai 4",
            "Address": "Bar Ilan 7",
            "City": "Ra'anana",
            "Latitude": 32.1817938,
            "Longitude": 34.873743,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dor Alon - Route 6 South, Magal",
            "Address": "Highway 6 Southbound",
            "City": "Magal",
            "Latitude": 32.3798073,
            "Longitude": 35.0165966,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Dor Alon - Route 6 North, Magal",
            "Address": "Highway 6 Northbound",
            "City": "Magal",
            "Latitude": 32.3813342,
            "Longitude": 35.0182796,
            "Operator": "AfconEv",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Elram Parking Lot, Ra’anana",
            "Address": "HaNegev 29",
            "City": "Ra'anana",
            "Latitude": 32.1805718,
            "Longitude": 34.8775285,
            "Operator": "AfconEv",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Municipal Employee Parking, Ashdod (Authorized Only)",
            "Address": "HaGdud HaIvri 10",
            "City": "Ashdod",
            "Latitude": 31.7921646,
            "Longitude": 34.6379829,
            "Operator": "AfconEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Elta Parking Lot - Authorized Only",
            "Address": "Yitzhak HaNasi 100",
            "City": "Ashdod",
            "Latitude": 31.797692,
            "Longitude": 34.666415,
            "Operator": "AfconEv",
            "Duplicate Count": 12.0
        },
        {
            "Station Name": "Gaaton Boulevard 54, Nahariya",
            "Address": "Sderot HaGa'aton 54",
            "City": "Nahariya",
            "Latitude": 33.007416,
            "Longitude": 35.089914,
            "Operator": "AfconEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Lopati Building, Weizmann Institute",
            "Address": "Herzl 234",
            "City": "Rehovot",
            "Latitude": 31.904686,
            "Longitude": 34.810388,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dvorah Omer - Circle of Life, Ashdod",
            "Address": "Devorah Omer",
            "City": "Ashdod",
            "Latitude": 31.7729935,
            "Longitude": 34.6187608,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "HaKeshetot Beach, Ashdod",
            "Address": "Kashtot Beach",
            "City": "Ashdod",
            "Latitude": 31.8001117,
            "Longitude": 34.6340242,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Lido Beach, Ashdod",
            "Address": "Lido Beach",
            "City": "Ashdod",
            "Latitude": 31.8081463,
            "Longitude": 34.6381799,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "David HaMelech Street 20, Ashdod",
            "Address": "David HaMelech 20",
            "City": "Ashdod",
            "Latitude": 31.7756084,
            "Longitude": 34.6422596,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Dor Alon - Dvira",
            "Address": "Dvira",
            "City": "Dvir",
            "Latitude": 31.4230065,
            "Longitude": 34.7861884,
            "Operator": "AfconEv",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Dor Alon - Eilot (Eilat)",
            "Address": "Eilat",
            "City": "Eilat",
            "Latitude": 29.577967,
            "Longitude": 34.966968,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Avraham Sofer Street 10, Ashdod",
            "Address": "Avraham Sofer 10",
            "City": "Ashdod",
            "Latitude": 31.7828705,
            "Longitude": 34.6475633,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "HaTzionut Street 10, Ashdod",
            "Address": "HaTzionut 10",
            "City": "Ashdod",
            "Latitude": 31.7869739,
            "Longitude": 34.6433458,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Shivtei Reuven Street 39, Ashdod",
            "Address": "Shevet Reuven 39",
            "City": "Ashdod",
            "Latitude": 31.7785503,
            "Longitude": 34.6358484,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Haruv Parking Lot",
            "Address": "Derech HaChorash 23",
            "City": "Hevel Modi'in",
            "Latitude": 32.0119,
            "Longitude": 34.962155,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Dan Accadia Hotel, Herzliya (Hotel Guests Only)",
            "Address": "Ramat Yam 122",
            "City": "Herzliya",
            "Latitude": 32.1669818,
            "Longitude": 34.7995052,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Sha’ar HaNegev Regional Council Parking Lot",
            "Address": "Regional Council Parking Lot Sha'ar HaNegev",
            "City": "Sha'ar HaNegev",
            "Latitude": 31.515916,
            "Longitude": 34.594962,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Kinneret Street 71, Ashdod",
            "Address": "Kinneret 71",
            "City": "Ashdod",
            "Latitude": 31.7843357,
            "Longitude": 34.6341853,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Beit Shamai Boulevard 10, Modi’in Illit",
            "Address": "Beit Shamai 10",
            "City": "Modi'in Illit",
            "Latitude": 31.9299307,
            "Longitude": 35.0458447,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Shoham Street 26, Ashdod",
            "Address": "Shoham 26",
            "City": "Ashdod",
            "Latitude": 31.7664914,
            "Longitude": 34.6307351,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Yoseftal Street 17, Ashdod",
            "Address": "Yoseftal 17",
            "City": "Ashdod",
            "Latitude": 31.8064159,
            "Longitude": 34.6538204,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Rabbi Yehuda HaNasi Street 35, Modi’in Illit",
            "Address": "Yehuda HaNasi 35",
            "City": "Modi'in Illit",
            "Latitude": 31.9386418,
            "Longitude": 35.0438122,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dov Gur Street 9, Ashdod",
            "Address": "Dov Gur 9",
            "City": "Ashdod",
            "Latitude": 31.793372,
            "Longitude": 34.652737,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Rabbi Yehuda HaNasi Street 4, Modi’in Illit",
            "Address": "Rabbi Yehuda HaNasi 4",
            "City": "Modi'in Illit",
            "Latitude": 31.9383606,
            "Longitude": 35.0391703,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Rosh Pina Street 7, Ashdod",
            "Address": "Rosh Pina 7",
            "City": "Ashdod",
            "Latitude": 31.784968,
            "Longitude": 34.6593137,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Rabbi Shimon Bar Yochai Street 16, Modi’in Illit",
            "Address": "Rabbi Shimon Bar Yochai 16",
            "City": "Modi'in Illit",
            "Latitude": 31.9377608,
            "Longitude": 35.0415323,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Bialik Street 15, Ashdod",
            "Address": "Dov Gur 9",
            "City": "Ashdod",
            "Latitude": 31.7964885,
            "Longitude": 34.6448079,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Yeshuat David Street 2, Modi’in Illit",
            "Address": "Yeshuat David 2",
            "City": "Modi'in Illit",
            "Latitude": 31.9230849,
            "Longitude": 35.0462583,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Netivot HaMishpat Street 94, Modi’in Illit",
            "Address": "Netivot HaMishpat 94",
            "City": "Modi'in Illit",
            "Latitude": 31.927555,
            "Longitude": 35.039668,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Bialik Street 10, Nahariya",
            "Address": "Bialik 10",
            "City": "Nahariya",
            "Latitude": 33.0218876,
            "Longitude": 35.0955178,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "HaMa’apilim Street 38, Nahariya",
            "Address": "HaMa'apilim 38",
            "City": "Nahariya",
            "Latitude": 33.01324,
            "Longitude": 35.090346,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Meharil Street 2, Modi’in Illit",
            "Address": "Meharyil 2",
            "City": "Modi'in Illit",
            "Latitude": 31.9301992,
            "Longitude": 35.0469318,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Nahariya IDB Promenade",
            "Address": "HaShaked",
            "City": "Nahariya",
            "Latitude": 32.9901576,
            "Longitude": 35.08364,
            "Operator": "AfconEv",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Ein Sarah Center, Nahariya",
            "Address": "Sderot Zalman Shazar 31",
            "City": "Nahariya",
            "Latitude": 32.9896315,
            "Longitude": 35.0894123,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dor Alon - Kibbutz Einat",
            "Address": "Dor Alon - Kibbutz Einat",
            "City": "Kibbutz Einat",
            "Latitude": 32.0896953,
            "Longitude": 34.9435449,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Park Gil Le’Kol Gil, Nahariya",
            "Address": "David Ben Gaon 36",
            "City": "Nahariya",
            "Latitude": 33.0273272,
            "Longitude": 35.0957475,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Nahariya Train Station Parking",
            "Address": "Sderot HaNasi Ben Tzvi 1",
            "City": "Nahariya",
            "Latitude": 33.004535,
            "Longitude": 35.099557,
            "Operator": "AfconEv",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "CD Towers, Ziv",
            "Address": "Raoul Wallenberg 24",
            "City": "Tel Aviv",
            "Latitude": 32.1109237,
            "Longitude": 34.8391282,
            "Operator": "AfconEv",
            "Duplicate Count": 11.0
        },
        {
            "Station Name": "David Remez Street",
            "Address": "David Remez 69",
            "City": "Rehovot",
            "Latitude": 31.895106,
            "Longitude": 34.804482,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dor Alon - Arad",
            "Address": "Dor Alon - Arad",
            "City": "Arad",
            "Latitude": 31.2544056,
            "Longitude": 35.2069233,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Pakris 3",
            "Address": "Pekris 3",
            "City": "Rehovot",
            "Latitude": 31.912078,
            "Longitude": 34.804762,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sapir Network - Pardes Hana-Karkur",
            "Address": "HaMa'aleh 5",
            "City": "Pardes Hanna-Karkur",
            "Latitude": 32.4727597,
            "Longitude": 34.972415,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gan HaMeyasdim",
            "Address": "Gan HaMeyasdim",
            "City": "Rehovot",
            "Latitude": 31.89342,
            "Longitude": 34.81029,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Park HaMada (Science Park)",
            "Address": "Meir and Mira Anatin",
            "City": "Rehovot",
            "Latitude": 31.910902,
            "Longitude": 34.809298,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Horowitz Park",
            "Address": "Pinchas Sapir",
            "City": "Rehovot",
            "Latitude": 31.89818,
            "Longitude": 34.787151,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Alfei Menashe Commercial Center",
            "Address": "Kinneret 4",
            "City": "Alfei Menashe",
            "Latitude": 32.1655896,
            "Longitude": 35.0188936,
            "Operator": "AfconEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Caps Pharma",
            "Address": "HaRitum 19",
            "City": "Jerusalem",
            "Latitude": 31.804182,
            "Longitude": 35.2103107,
            "Operator": "AfconEv",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "The House in Ganei Tikva (Authorized Only)",
            "Address": "Derech HaYam 5",
            "City": "Ganei Tikva",
            "Latitude": 32.0641339,
            "Longitude": 34.876423,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Karnei Shomron - Ma’ale Shomron Grove",
            "Address": "Ma'ale Shomron Grove",
            "City": "Karnei Shomron",
            "Latitude": 32.1655745,
            "Longitude": 35.0711817,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Elpasi Parking Lot",
            "Address": "Alfasi 14",
            "City": "Tel Aviv",
            "Latitude": 32.0532619,
            "Longitude": 34.766837,
            "Operator": "AfconEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Karnei Shomron - Rehavam Ze'evi Boulevard",
            "Address": "Sderot Rehavam 1",
            "City": "Karnei Shomron",
            "Latitude": 32.17478,
            "Longitude": 35.08986,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Yitzhak Rabin Street 41, Kiryat Ono",
            "Address": "Yitzhak Rabin 41",
            "City": "Kiryat Ono",
            "Latitude": 32.064492,
            "Longitude": 34.8620037,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "HaMa’agal Street 60, Kiryat Ono",
            "Address": "HaMa'agal 60",
            "City": "Kiryat Ono",
            "Latitude": 32.0482749,
            "Longitude": 34.8653581,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Yigal Alon Street 7, Kiryat Ono",
            "Address": "Yigal Alon 7",
            "City": "Kiryat Ono",
            "Latitude": 32.065083,
            "Longitude": 34.845618,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Yaakov Dori Street 7, Kiryat Ono",
            "Address": "Yaakov Parking Lot 7",
            "City": "Kiryat Ono",
            "Latitude": 32.049796,
            "Longitude": 34.85647,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dor Alon - Tel Yitzhak",
            "Address": "Tel Yitzhak",
            "City": "Tel Yitzhak",
            "Latitude": 32.2549158,
            "Longitude": 34.8742394,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Yuvalim Center Parking Lot, Kiryat Ono",
            "Address": "Yaakov Parking Lot - Yuvalim Center",
            "City": "Kiryat Ono",
            "Latitude": 32.055767,
            "Longitude": 34.857827,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Alumim Sports Hall, Kiryat Ono",
            "Address": "HaKfar 1 Kiryat Ono",
            "City": "Kiryat Ono",
            "Latitude": 32.0555865,
            "Longitude": 34.8528893,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "KKL Municipal Pool, Kiryat Ono",
            "Address": "Sderot KKL 4",
            "City": "Kiryat Ono",
            "Latitude": 32.064845,
            "Longitude": 34.850235,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Magen David Adom, Kiryat Ono",
            "Address": "Shai Agnon",
            "City": "Kiryat Ono",
            "Latitude": 32.056367,
            "Longitude": 34.865533,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Weizmann Street 23, Gedera",
            "Address": "Weizmann 23",
            "City": "Gedera",
            "Latitude": 31.817786,
            "Longitude": 34.7813219,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Shmuel Katz",
            "Address": "Weizmann Parking Lot Shmuel Katz",
            "City": "Gedera",
            "Latitude": 31.8187905,
            "Longitude": 34.7772045,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Marvad HaKesamim Parking Lot, Gedera",
            "Address": "Marvad HaKesamim 12",
            "City": "Gedera",
            "Latitude": 31.817965,
            "Longitude": 34.779198,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Rimonim",
            "Address": "Derech Yitzhak Rabin",
            "City": "Gedera",
            "Latitude": 31.7981352,
            "Longitude": 34.7867451,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Tziporim Parking Lot",
            "Address": "HaLochemim Street",
            "City": "Holon",
            "Latitude": 32.0303773,
            "Longitude": 34.77154,
            "Operator": "AfconEv",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Hei Be'Iyar Street",
            "Address": "Hey B’Iyar 18",
            "City": "Holon",
            "Latitude": 32.026613,
            "Longitude": 34.7733803,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "HaNafach Street",
            "Address": "HaNafach 7",
            "City": "Holon",
            "Latitude": 32.0204447,
            "Longitude": 34.7964309,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Park and Ride - Komemiyut",
            "Address": "Hannah Parking Lot Komemiyut",
            "City": "Holon",
            "Latitude": 32.0007864,
            "Longitude": 34.7613109,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Natanel Center",
            "Address": "Degania 27",
            "City": "Holon",
            "Latitude": 32.0138219,
            "Longitude": 34.7778864,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ge’ulim Street, Holon",
            "Address": "Geulim 43",
            "City": "Holon",
            "Latitude": 32.0144784,
            "Longitude": 34.7834513,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dor Alon - Givat Oz",
            "Address": "Dor Alon - Givat Oz",
            "City": "Givat Oz",
            "Latitude": 32.5731103,
            "Longitude": 35.1970845,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Meditech Parking Lot",
            "Address": "Ilona Fehr",
            "City": "Holon",
            "Latitude": 32.0113453,
            "Longitude": 34.7764966,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Design Museum",
            "Address": "Pinchas Eilon 58",
            "City": "Holon",
            "Latitude": 32.0114304,
            "Longitude": 34.7783159,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "HaMerkava",
            "Address": "HaMerkava 31",
            "City": "Holon",
            "Latitude": 32.009626,
            "Longitude": 34.808049,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "HaMelacha Street 47",
            "Address": "HaMelacha Street 47",
            "City": "Holon",
            "Latitude": 32.0148,
            "Longitude": 34.799618,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Warsaw Park, Kiryat Ono",
            "Address": "Herzl Corner Emil Zola",
            "City": "Kiryat Ono",
            "Latitude": 32.0660931,
            "Longitude": 34.8570375,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "HaMelacha Street 28",
            "Address": "HaMelacha Street 28",
            "City": "Holon",
            "Latitude": 32.0174385,
            "Longitude": 34.8016473,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Municipality Parking - Dam HaMaccabim 16",
            "Address": "16 Dam HaMaccabim",
            "City": "Modi'in-Maccabim-Re'ut",
            "Latitude": 31.9083188,
            "Longitude": 35.0075586,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Yehuda HaMaccabi Street 3, Kiryat Ono",
            "Address": "Yehuda HaMaccabi 3 Kiryat Ono",
            "City": "Kiryat Ono",
            "Latitude": 32.06084,
            "Longitude": 34.85507,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Zeidman Street 22, Kiryat Ono",
            "Address": "Zeidman 22",
            "City": "Kiryat Ono",
            "Latitude": 32.06227,
            "Longitude": 34.8612,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Emek Dotan Parking Lot",
            "Address": "Emek Dotan 50",
            "City": "Modi'in-Maccabim-Re'ut",
            "Latitude": 31.899584,
            "Longitude": 35.014258,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Municipal Pool",
            "Address": "Yigal Yadin",
            "City": "Modi'in-Maccabim-Re'ut",
            "Latitude": 31.902456,
            "Longitude": 35.003234,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Or Yam Center",
            "Address": "Levonah 4",
            "City": "Caesarea",
            "Latitude": 32.484331,
            "Longitude": 34.914657,
            "Operator": "AfconEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Lev Ha'Ir Parking Lot, Modi’in-Maccabim-Re'ut",
            "Address": "Lev HaIr Parking Lot",
            "City": "Modi'in-Maccabim-Re'ut",
            "Latitude": 31.898426,
            "Longitude": 35.0079046,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Dor Alon - Tziporit",
            "Address": "Dor Alon - Tzipporit",
            "City": "Dor Alon-Tziporit",
            "Latitude": 32.763872,
            "Longitude": 35.322343,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Municipal Football Stadium Parking Lot",
            "Address": "City Stadium Parking Lot",
            "City": "Modi'in-Maccabim-Re'ut",
            "Latitude": 31.91885,
            "Longitude": 34.978107,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Patei Modi’in Train Station Parking Lot",
            "Address": "Patei Modiin Train Station Parking Lot",
            "City": "Modi'in-Maccabim-Re'ut",
            "Latitude": 31.891934,
            "Longitude": 34.962102,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "HaEla Garden Parking Lot",
            "Address": "Ginot HaEla",
            "City": "Modi'in-Maccabim-Re'ut",
            "Latitude": 31.912585,
            "Longitude": 35.01032,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Main Boulevard",
            "Address": "HaShdera HaMerkazit 16",
            "City": "Modi'in-Maccabim-Re'ut",
            "Latitude": 31.922776,
            "Longitude": 34.968639,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Leah Imenu",
            "Address": "Leah Imenu 2",
            "City": "Modi'in-Maccabim-Re'ut",
            "Latitude": 31.8851487,
            "Longitude": 35.005477,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Pisga Center, Yitzhak Rabin Boulevard 4",
            "Address": "Sderot Yitzhak Rabin 4",
            "City": "Modi'in-Maccabim-Re'ut",
            "Latitude": 31.8912464,
            "Longitude": 35.0073989,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "BIG Be’er Sheva - Lower Parking Lot",
            "Address": "Sderot Eliyahu Navi 18",
            "City": "Be'er Sheva",
            "Latitude": 31.241616,
            "Longitude": 34.812749,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Dor Alon - Lahavot Haviva",
            "Address": "Dor Alon - Lahavot Haviva",
            "City": "Lahavot Haviva",
            "Latitude": 32.3966928,
            "Longitude": 35.0066659,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Dor Alon - Beit Keshet",
            "Address": "Dor Alon - Beit Keshet",
            "City": "Beit Keshet",
            "Latitude": 32.7053139,
            "Longitude": 35.4102671,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Dor Alon - Goma Junction",
            "Address": "Goma Junction",
            "City": "HaGoma",
            "Latitude": 33.1700439,
            "Longitude": 35.5709742,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dor Alon - Yas'ur",
            "Address": "Yasur Junction",
            "City": "Yasur",
            "Latitude": 32.8998984,
            "Longitude": 35.1700603,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Joe Fuel - Zichron Yaakov",
            "Address": "Sderot Nili",
            "City": "Zikhron Ya'akov",
            "Latitude": 32.569618,
            "Longitude": 34.936204,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dor Alon - Ir Yamim",
            "Address": "Dor Alon - Ir Yamim",
            "City": "Netanya",
            "Latitude": 32.27916,
            "Longitude": 34.848412,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "DC - BIG Carmiel",
            "Address": "Ma'ale Kamon",
            "City": "Karmiel",
            "Latitude": 32.92699,
            "Longitude": 35.321671,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Kidron Stream",
            "Address": "Nahal Kidron",
            "City": "Nokdim",
            "Latitude": 31.6448808,
            "Longitude": 35.242438,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kedem Stream",
            "Address": "Nahal Kedem",
            "City": "Nokdim",
            "Latitude": 31.6482541,
            "Longitude": 35.2453108,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Economic Company Parking Lot, Misgav",
            "Address": "Industrial Park",
            "City": "Misgav",
            "Latitude": 32.8659674,
            "Longitude": 35.2760248,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Dan Hotels - Dan Caesarea Hotel",
            "Address": "Rothschild 1",
            "City": "Caesarea",
            "Latitude": 32.498328,
            "Longitude": 34.9039065,
            "Operator": "AfconEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Misgav Country Club",
            "Address": "Village Club",
            "City": "Misgav",
            "Latitude": 32.8603935,
            "Longitude": 35.2589602,
            "Operator": "AfconEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Prima Park Hotel (Hotel Guests Only)",
            "Address": "Ze'ev Vilnai 8",
            "City": "Jerusalem",
            "Latitude": 31.7850408,
            "Longitude": 35.1981849,
            "Operator": "AfconEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Regional Council Building Parking Lot, Misgav",
            "Address": "Regional Council",
            "City": "Misgav",
            "Latitude": 32.8586763,
            "Longitude": 35.2608631,
            "Operator": "AfconEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Prima Royale Hotel",
            "Address": "Mendele Mokher Sefarim 3",
            "City": "Jerusalem",
            "Latitude": 31.7722049,
            "Longitude": 35.2205425,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Belsky (Gas Station) - Ginosar",
            "Address": "Gas Station - Ginosar Junction",
            "City": "Ginosar",
            "Latitude": 32.845126,
            "Longitude": 35.516653,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Givat Brenner Comprehensive School",
            "Address": "Comprehensive High School",
            "City": "Givat Brenner",
            "Latitude": 31.86922,
            "Longitude": 34.805207,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "HaHagana Street 8",
            "Address": "HaHagana 8",
            "City": "Ramat HaSharon",
            "Latitude": 32.1465375,
            "Longitude": 34.8406431,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Jerusalem Theater Parking Lot",
            "Address": "Prof. Yaakov Sheskin",
            "City": "Jerusalem",
            "Latitude": 31.767977,
            "Longitude": 35.216197,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Yitzhak Elhanan Street 8, Ramat HaSharon",
            "Address": "Yitzhak Elhanan 8",
            "City": "Ramat HaSharon",
            "Latitude": 32.1486958,
            "Longitude": 34.8306883,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Theater Hotel Parking Lot",
            "Address": "Prof. Yaakov Sheskin",
            "City": "Jerusalem",
            "Latitude": 31.76812,
            "Longitude": 35.215884,
            "Operator": "AfconEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "HaPardes Street 17, Ramat HaSharon",
            "Address": "HaPardes 17",
            "City": "Ramat HaSharon",
            "Latitude": 32.1439034,
            "Longitude": 34.8430687,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Yitzhak Sade Street 4 - Education Wing",
            "Address": "Yitzhak Sadeh 4",
            "City": "Ramat HaSharon",
            "Latitude": 32.1349707,
            "Longitude": 34.8471731,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gad Street 3, Ramat HaSharon - Parking Lot",
            "Address": "Gad 3",
            "City": "Ramat HaSharon",
            "Latitude": 32.1468365,
            "Longitude": 34.8397287,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Valley of Springs - Council Parking Lot",
            "Address": "Council Parking Lot",
            "City": "Beit She'an",
            "Latitude": 32.493876,
            "Longitude": 35.519584,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Efrat Center Commercial Center",
            "Address": "Commercial Center Parking Lot Efrat Center",
            "City": "Efrat",
            "Latitude": 31.6686793,
            "Longitude": 35.1629743,
            "Operator": "AfconEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "HaZayit Street, Ramat HaSharon",
            "Address": "HaZayit 10",
            "City": "Ramat HaSharon",
            "Latitude": 32.1334151,
            "Longitude": 34.8439976,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Paz Gas Station - Kiryat Arba",
            "Address": "Sulam Gas Station Paz",
            "City": "Kiryat Arba",
            "Latitude": 31.542458,
            "Longitude": 35.131638,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Zalman Shneor Street 9, Ramat HaSharon",
            "Address": "Zalman Shneor 9",
            "City": "Ramat HaSharon",
            "Latitude": 32.1479726,
            "Longitude": 34.838391,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gur Aryeh Street",
            "Address": "Gur Aryeh",
            "City": "Kiryat Arba",
            "Latitude": 31.5294312,
            "Longitude": 35.1194874,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Caleb Ben Yefuneh Boulevard - Hebron Valley",
            "Address": "Sderot Kalev Ben Yefuneh / Emek Hevron",
            "City": "Kiryat Arba",
            "Latitude": 31.5315986,
            "Longitude": 35.1146173,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Komemiyut Street 9, Ramat HaSharon",
            "Address": "Komemiyut 9",
            "City": "Ramat HaSharon",
            "Latitude": 32.1361373,
            "Longitude": 34.8366516,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gush Defenders (Opposite Municipal Library)",
            "Address": "Maginei HaGush Alon Shvut",
            "City": "Alon Shvut",
            "Latitude": 31.6525095,
            "Longitude": 35.1281499,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Padoim Street",
            "Address": "Pduim",
            "City": "Ramat HaSharon",
            "Latitude": 32.1493499,
            "Longitude": 34.8452304,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "BIG Kiryat Ata - Area 2",
            "Address": "Sderot HaHistadrut 248",
            "City": "Kiryat Ata",
            "Latitude": 32.8105732,
            "Longitude": 35.073301,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Yamit Parking Lot - Waldorf Astoria Hotel",
            "Address": "Gershon Agron 28",
            "City": "Jerusalem",
            "Latitude": 31.7774083,
            "Longitude": 35.2218808,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Nili Street 2, Gan Yavne",
            "Address": "Nili 2",
            "City": "Gan Yavne",
            "Latitude": 31.7888451,
            "Longitude": 34.7182545,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Acro Parking Lot",
            "Address": "Abba Hillel 19",
            "City": "Ramat Gan",
            "Latitude": 32.0857082,
            "Longitude": 34.8043192,
            "Operator": "AfconEv",
            "Duplicate Count": 9.0
        },
        {
            "Station Name": "Katzenelson Street 10, Ashkelon",
            "Address": "Katznelson 10",
            "City": "Ashkelon",
            "Latitude": 31.6617665,
            "Longitude": 34.5871743,
            "Operator": "AfconEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Yamit Parking Lot - Orient Hotel",
            "Address": "Beit Lechem 8",
            "City": "Jerusalem",
            "Latitude": 31.766688,
            "Longitude": 35.223759,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "SPAR Supermarket, Kfar Saba",
            "Address": "Eli Horowitz 26",
            "City": "Kfar Saba",
            "Latitude": 32.1758142,
            "Longitude": 34.9351252,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Elisha Hospital Parking Lot",
            "Address": "Yair Katz 12",
            "City": "Haifa",
            "Latitude": 32.8012053,
            "Longitude": 34.9922641,
            "Operator": "AfconEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Weizmann Institute - Archives",
            "Address": "Weizmann Institute - Genizah 234",
            "City": "Rehovot",
            "Latitude": 31.9073128,
            "Longitude": 34.8183504,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dan Hotels - Dan Panorama",
            "Address": "Tarshish 18",
            "City": "Eilat",
            "Latitude": 29.5526118,
            "Longitude": 34.9585093,
            "Operator": "AfconEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Dor Alon - Yokneam",
            "Address": "Dor Alon - Yokneam",
            "City": "Yokneam",
            "Latitude": 32.6679662,
            "Longitude": 35.107282,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Mamilla Parking Lot - Level -5",
            "Address": "Yitzhak Kariv 1",
            "City": "Jerusalem",
            "Latitude": 31.777271,
            "Longitude": 35.224901,
            "Operator": "AfconEv",
            "Duplicate Count": 12.0
        },
        {
            "Station Name": "Adam Gas Station",
            "Address": "Peqi’in",
            "City": "Peki'in",
            "Latitude": 32.9848886,
            "Longitude": 35.3267141,
            "Operator": "AfconEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Prima City Hotel, Tel Aviv (Hotel Guests Only)",
            "Address": "Mapu 9",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.0808518,
            "Longitude": 34.7695271,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Okeanos Hotel, Herzliya",
            "Address": "Ramat Yam 50",
            "City": "Herzliya",
            "Latitude": 32.1729447,
            "Longitude": 34.8013373,
            "Operator": "AfconEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Orchid Hotel, Tel Aviv (Hotel Guests Only)",
            "Address": "Herbert Samuel Promenade 90",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.0772793,
            "Longitude": 34.7664463,
            "Operator": "AfconEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Setai Hotel - Tzalon Beach",
            "Address": "Hof Tzalon",
            "City": "Kinneret",
            "Latitude": 32.8366577,
            "Longitude": 35.6487437,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Milos Hotel, Dead Sea (Hotel Guests Only)",
            "Address": "Ein Bokek",
            "City": "Dead Sea",
            "Latitude": 31.201437,
            "Longitude": 35.364503,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "HaMusachim Street 3",
            "Address": "HaMosachim 3",
            "City": "Haifa",
            "Latitude": 32.791884,
            "Longitude": 35.038396,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kodak Parking Lot 1 (Authorized Only)",
            "Address": "Hatnufa 7",
            "City": "Petah Tikva",
            "Latitude": 32.1000419,
            "Longitude": 34.8579631,
            "Operator": "AfconEv",
            "Duplicate Count": 15.0
        },
        {
            "Station Name": "Dor Alon - Beit Dagan Junction",
            "Address": "Dor Alon - Beit Dagan",
            "City": "Beit Dagan",
            "Latitude": 31.9901472,
            "Longitude": 34.8297984,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Bialik Street 45, Ramat HaSharon",
            "Address": "Bialik 45",
            "City": "Ramat HaSharon",
            "Latitude": 32.1442428,
            "Longitude": 34.8445376,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Football Stadium, Nahariya",
            "Address": "Sderot Sheshet HaYamim/Shalom HaGalil, Nahariya",
            "City": "Nahariya",
            "Latitude": 33.0108817,
            "Longitude": 35.113112,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ariel Sharon School, Nahariya",
            "Address": "Milchemet Yom Kippur 6",
            "City": "Nahariya",
            "Latitude": 33.0113269,
            "Longitude": 35.1076615,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Golda School, Nahariya",
            "Address": "Weizmann 117",
            "City": "Nahariya",
            "Latitude": 32.9983215,
            "Longitude": 35.0912247,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Technological Gardens - Ella Building (Authorized Only)",
            "Address": "Hayaen 4",
            "City": "Jerusalem",
            "Latitude": 31.750587,
            "Longitude": 35.186604,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Technological Gardens - Erez Building (Authorized Only)",
            "Address": "Hayaen 4",
            "City": "Jerusalem",
            "Latitude": 31.750897,
            "Longitude": 35.185875,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Dor Alon - Ein Shemer",
            "Address": "Ein Shemer",
            "City": "Ein Shemer",
            "Latitude": 32.4658318,
            "Longitude": 34.9919827,
            "Operator": "AfconEv",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Technological Gardens - Building 23 (Authorized Only)",
            "Address": "Hayaen 4",
            "City": "Jerusalem",
            "Latitude": 31.750874,
            "Longitude": 35.186222,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Technion - Faculty of Physics",
            "Address": "3200003",
            "City": "Haifa",
            "Latitude": 32.776635,
            "Longitude": 35.0246174,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Technological Gardens - Alon A Building (Authorized Only)",
            "Address": "Hayaen 4",
            "City": "Jerusalem",
            "Latitude": 31.748896,
            "Longitude": 35.186661,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Technological Gardens - Alon B Building (Authorized Only)",
            "Address": "Hayaen 4",
            "City": "Jerusalem",
            "Latitude": 31.749006,
            "Longitude": 35.187485,
            "Operator": "AfconEv",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Mahane Yehuda Market",
            "Address": "Kiyah 2",
            "City": "Jerusalem",
            "Latitude": 31.784342,
            "Longitude": 35.214027,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sapir Network - Ma’alot-Tarshiha",
            "Address": "Haroshet 8",
            "City": "Ma'alot-Tarshiha",
            "Latitude": 33.01794,
            "Longitude": 35.2787,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Paz Gas Station - Lamed",
            "Address": "Highway 2040",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.1293678,
            "Longitude": 34.789414,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Dor Alon - Kibbutz Kfar Aza",
            "Address": "Dor Alon - Kfar Aza",
            "City": "Kfar Aza",
            "Latitude": 31.4770334,
            "Longitude": 34.5359377,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Jerusalem Towers",
            "Address": "Rabbi Akiva 6",
            "City": "Jerusalem",
            "Latitude": 31.779729,
            "Longitude": 35.217995,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dor Alon - Mitzpe Ramon",
            "Address": "Dor Alon - Mitzpe Ramon",
            "City": "Mitzpe Ramon",
            "Latitude": 30.6279892,
            "Longitude": 34.8054922,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Castria Mall, Haifa (Upper Level)",
            "Address": "Derech Moshe Fliman 8",
            "City": "Haifa",
            "Latitude": 32.7878826,
            "Longitude": 34.9680247,
            "Operator": "AfconEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Intergreen 2 - Upper Parking Lot (Authorized Only)",
            "Address": "HaPsagot 4",
            "City": "Petah Tikva",
            "Latitude": 32.0993686,
            "Longitude": 34.8551632,
            "Operator": "AfconEv",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Opposite the Synagogue - Library",
            "Address": "Near the Synagogue Library",
            "City": "Elazar",
            "Latitude": 31.66218,
            "Longitude": 35.14072,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Intergreen 2 - Lower Parking Lot (Authorized Only)",
            "Address": "HaPsagot 4",
            "City": "Petah Tikva",
            "Latitude": 32.0993686,
            "Longitude": 34.8551632,
            "Operator": "AfconEv",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Dor Alon - Bnei Re'em",
            "Address": "Dor Alon - Bnei Re'em",
            "City": "Bnei Re'em",
            "Latitude": 31.7725725,
            "Longitude": 34.7810206,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Intergreen 3 Chargers 1-10 (Authorized Only)",
            "Address": "Dor Alon - Bnei Re'em",
            "City": "Petah Tikva",
            "Latitude": 32.0979924,
            "Longitude": 34.8556549,
            "Operator": "AfconEv",
            "Duplicate Count": 10.0
        },
        {
            "Station Name": "Dor Alon - Kvutzat Yavne",
            "Address": "Yagiy Kapayim 17",
            "City": "Yavne Settlements",
            "Latitude": 31.8190302,
            "Longitude": 34.7300917,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kodak Parking Lot 2 (Authorized Only)",
            "Address": "Dor Alon - Kvutzat Yavne",
            "City": "Petah Tikva",
            "Latitude": 32.1000419,
            "Longitude": 34.8579631,
            "Operator": "AfconEv",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Dor Alon - Bnei Zion",
            "Address": "Hatnufa 7",
            "City": "Bnei Zion",
            "Latitude": 32.2209697,
            "Longitude": 34.8825922,
            "Operator": "AfconEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Dor Alon - Gesher HaZiv",
            "Address": "Dor Alon - Bnei Zion",
            "City": "Gesher HaZiv",
            "Latitude": 33.0449021,
            "Longitude": 35.1068101,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Valley of Springs - Kimron Hall",
            "Address": "Dor Alon - Gesher HaZiv",
            "City": "Beit She'an",
            "Latitude": 32.495137,
            "Longitude": 35.515693,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Admin Lower Parking Lot (Authorized Only)",
            "Address": "Kimaron Hall",
            "City": "Ashdod",
            "Latitude": 31.8374219,
            "Longitude": 34.6524296,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Setai Hotel, Jaffa",
            "Address": "Halutzei HaTaasiya 2",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.0561741,
            "Longitude": 34.7563595,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Harduf HaNachalim 20, Caesarea",
            "Address": "David Remez 22",
            "City": "Caesarea",
            "Latitude": 32.4734296,
            "Longitude": 34.9479577,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Dor Alon - Yarkonim Junction",
            "Address": "Raduf Neharim 20",
            "City": "Petah",
            "Latitude": 32.097276,
            "Longitude": 34.895719,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Caesarea Port 2",
            "Address": "HaYarkonim 1",
            "City": "Caesarea",
            "Latitude": 32.501802,
            "Longitude": 34.894363,
            "Operator": "AfconEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Dor Alon - Yesodot",
            "Address": "Highway 6511",
            "City": "Yesodot",
            "Latitude": 31.810672,
            "Longitude": 34.860276,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dor Alon - Route 6 Na’an West",
            "Address": "Dor Alon Yesodot",
            "City": "Na'an",
            "Latitude": 31.8824226,
            "Longitude": 34.8784631,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Dor Alon - Route 6 Na’an East",
            "Address": "Highway 6 Naan East",
            "City": "Na'an",
            "Latitude": 31.8816996,
            "Longitude": 34.8795666,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Mamilla Hotel Parking Lot (Hotel Guests Only)",
            "Address": "Yitzhak Kariv 1",
            "City": "Jerusalem",
            "Latitude": 31.777271,
            "Longitude": 35.224901,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Admin Upper Parking Lot (Authorized Only)",
            "Address": "Halutzei HaTaasiya 2",
            "City": "Ashdod",
            "Latitude": 31.8375221,
            "Longitude": 34.6525905,
            "Operator": "AfconEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Oasis Hotel, Dead Sea (Hotel Guests Only)",
            "Address": "Ein Bokek",
            "City": "Dead Sea",
            "Latitude": 31.1952378,
            "Longitude": 35.3614903,
            "Operator": "AfconEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Prima Hotel, Eilat (Hotel Guests Only)",
            "Address": "Almog Beach",
            "City": "Eilat",
            "Latitude": 29.515329,
            "Longitude": 34.9245565,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "David’s Citadel Parking Lot - Mamilla",
            "Address": "David Citadel Parking",
            "City": "Jerusalem",
            "Latitude": 31.7774069,
            "Longitude": 35.2233719,
            "Operator": "AfconEv",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Beit Moshe - Outdoor Parking",
            "Address": "Derech Ben Gurion",
            "City": "Ashkelon",
            "Latitude": 31.6610519,
            "Longitude": 34.5868998,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Emek Hefer - Tiv Taam",
            "Address": "Emek Hefer - Tiv Taam",
            "City": "Emek Hefer Regional Council",
            "Latitude": 32.4013181,
            "Longitude": 34.9007512,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Castria Mall, Haifa (Lower Level)",
            "Address": "Derech Moshe Fliman 8",
            "City": "Haifa",
            "Latitude": 32.7884615,
            "Longitude": 34.9676622,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ramot Holiday Village, Kinneret",
            "Address": "Northeast Kinneret, Ramot",
            "City": "Ramat",
            "Latitude": 32.8593323,
            "Longitude": 35.6599626,
            "Operator": "AfconEv",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Beit HaGalil Hotel",
            "Address": "Biriya Forest Park",
            "City": "Hatzor HaGlilit",
            "Latitude": 32.988456,
            "Longitude": 35.5377568,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Orchid Hotel, Eilat (Hotel Guests Only)",
            "Address": "Highway 90",
            "City": "Eilat",
            "Latitude": 29.5055682,
            "Longitude": 34.9176798,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "HaHorsh Parking Lot",
            "Address": "Shoham Forest Parking Lot",
            "City": "Hevel Modi'in",
            "Latitude": 32.005767,
            "Longitude": 34.961779,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "HaAgas Parking Lot",
            "Address": "Derech HaChorash 15",
            "City": "Hevel Modi'in",
            "Latitude": 32.007445,
            "Longitude": 34.961846,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "HaGefen Parking Lot",
            "Address": "Derech HaChorash",
            "City": "Hevel Modi'in",
            "Latitude": 32.008809,
            "Longitude": 34.962084,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Intergreen 1 - Open Parking Lot (Authorized Only)",
            "Address": "HaMefalsim 17",
            "City": "Petah Tikva",
            "Latitude": 32.1010906,
            "Longitude": 34.8622487,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Beit Ampa - Sapir 7, Herzliya",
            "Address": "Sapphire 7",
            "City": "Herzliya",
            "Latitude": 32.1633933,
            "Longitude": 34.8106892,
            "Operator": "AfconEv",
            "Duplicate Count": 22.0
        },
        {
            "Station Name": "Emmanuel - Rabbi Meir MiPremishlan",
            "Address": "Rabbi Meir MiPremishlan",
            "City": "Emmanuel",
            "Latitude": 32.1608693,
            "Longitude": 35.1363235,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Hod Hotel, Dead Sea (Hotel Guests Only)",
            "Address": "Ein Bokek",
            "City": "Dead Sea",
            "Latitude": 31.201942,
            "Longitude": 35.36364,
            "Operator": "AfconEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Technion - Faculty of Chemistry (Schulich)",
            "Address": "3200003",
            "City": "Haifa",
            "Latitude": 32.7776126,
            "Longitude": 35.0267005,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Dor Alon - Gan Yavne",
            "Address": "Dor Alon - Gan Yavne",
            "City": "Gan Yavne",
            "Latitude": 31.786856,
            "Longitude": 34.677035,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Emek Hefer - Banim Square",
            "Address": "Beit Yitzhak - Bnei Rahavat Square",
            "City": "Emek Hefer Regional Council",
            "Latitude": 32.327841,
            "Longitude": 34.88971,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Emek Hefer - Hofit Tennis Courts",
            "Address": "Hofitkin Tennis Center",
            "City": "Emek Hefer Regional Council",
            "Latitude": 32.3862032,
            "Longitude": 34.8822137,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Limor Peleg",
            "Address": "Building France Euro Park",
            "City": "Yakum",
            "Latitude": 32.2485115,
            "Longitude": 34.8360619,
            "Operator": "AfconEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Papi Restaurant, Eilat",
            "Address": "Arava Road",
            "City": "Eilat",
            "Latitude": 29.562448,
            "Longitude": 34.9592274,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "David Tower Hotel, Netanya (Hotel Guests Only)",
            "Address": "David HaMelech 8",
            "City": "Netanya",
            "Latitude": 32.3317221,
            "Longitude": 34.8515544,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "GT Center, Netivot",
            "Address": "Baalei HaMelacha",
            "City": "Netivot",
            "Latitude": 31.419075,
            "Longitude": 34.59893,
            "Operator": "AfconEv",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Shoham Street 1, Ashdod",
            "Address": "Shoham 1",
            "City": "Ashdod",
            "Latitude": 31.7666761,
            "Longitude": 34.6294456,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Gandi Beach (Arches), Ashdod",
            "Address": "Mapkura 4",
            "City": "Ashdod",
            "Latitude": 31.7978465,
            "Longitude": 34.6319076,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Dune Community Center and Police Parking Lot",
            "Address": "KKL 90",
            "City": "Ashdod",
            "Latitude": 31.778956,
            "Longitude": 34.6490278,
            "Operator": "AfconEv",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Promenade Parking Lot, Jonah HaNavi Street 2, Ashdod",
            "Address": "Yonah HaNavi 2",
            "City": "Ashdod",
            "Latitude": 31.8141895,
            "Longitude": 34.6416488,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Beach Yud Alef Parking Lot, Ashdod",
            "Address": "Beach Lot Ya",
            "City": "Ashdod",
            "Latitude": 31.7878267,
            "Longitude": 34.6269415,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Beit Lebron Parking Lot, Ashdod",
            "Address": "Natan Elbaz 19",
            "City": "Ashdod",
            "Latitude": 31.7945761,
            "Longitude": 34.6534267,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Dor Alon - Ammiad",
            "Address": "Ami'ad",
            "City": "Ammiad",
            "Latitude": 32.925138,
            "Longitude": 35.543071,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Level 7 (Authorized Only)",
            "Address": "Rothschild 22",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.0628077,
            "Longitude": 34.7714476,
            "Operator": "AfconEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Level 5 (Authorized Only)",
            "Address": "Rothschild 22",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.0628077,
            "Longitude": 34.7714476,
            "Operator": "AfconEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Level 6 (Authorized Only)",
            "Address": "Rothschild 22",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.0628077,
            "Longitude": 34.7714476,
            "Operator": "AfconEv",
            "Duplicate Count": 1.0
        },
        {
            "Station Name": "Gan Elisheva Parking Lot, Ashdod",
            "Address": "Gan Elishava",
            "City": "Ashdod",
            "Latitude": 31.8083227,
            "Longitude": 34.6398502,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Mega Or Ariel - Upper Parking Lot",
            "Address": "HaBanai",
            "City": "Ariel",
            "Latitude": 32.1007172,
            "Longitude": 35.1701921,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Mega Or - Beit Gali Industrial Park, Shilat",
            "Address": "Beit Gali",
            "City": "Moshav Shilat",
            "Latitude": 31.9145145,
            "Longitude": 35.0241155,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Mega Or Center - Modi’in",
            "Address": "HaNafach",
            "City": "Modi'in",
            "Latitude": 31.8893988,
            "Longitude": 34.9667982,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Mega Or - Kfar Saba",
            "Address": "Galgelei HaPlada 5",
            "City": "Kfar Saba",
            "Latitude": 32.1733521,
            "Longitude": 34.9283866,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Atidim Park (Kiryat Atidim), Tel Aviv",
            "Address": "Atidim Park",
            "City": "Tel Aviv",
            "Latitude": 32.1145297,
            "Longitude": 34.843289,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Mega Or - Afula",
            "Address": "HaShuk 13",
            "City": "Afula",
            "Latitude": 32.6061191,
            "Longitude": 35.2929707,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Mega Or - Kiryat Motzkin",
            "Address": "Jerusalem Boulevard 1",
            "City": "Kiryat Motzkin",
            "Latitude": 32.858588,
            "Longitude": 35.092568,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Mega Or Modi’in - Lower Parking Lot",
            "Address": "HaKadar 8",
            "City": "Modi'in",
            "Latitude": 31.8889829,
            "Longitude": 34.9655017,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Mega Or Modi’in 2",
            "Address": "HaSocher",
            "City": "Modi'in",
            "Latitude": 31.890773,
            "Longitude": 34.963958,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Mega Or - Shoham",
            "Address": "HaEgoz 9",
            "City": "Shoham",
            "Latitude": 32.0128795,
            "Longitude": 34.958452,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Intergreen 1 - Closed Parking Lot (Authorized Only)",
            "Address": "HaMefalsim 17",
            "City": "Petah Tikva",
            "Latitude": 32.1010906,
            "Longitude": 34.8622487,
            "Operator": "AfconEv",
            "Duplicate Count": 7.0
        },
        {
            "Station Name": "Assuta Ashdod Parking Lot",
            "Address": "HaRefua 7",
            "City": "Ashdod",
            "Latitude": 31.7801351,
            "Longitude": 34.6567338,
            "Operator": "AfconEv",
            "Duplicate Count": 18.0
        },
        {
            "Station Name": "Beit Berl Academic College",
            "Address": "South Sharon",
            "City": "Kfar Saba",
            "Latitude": 32.20164,
            "Longitude": 34.928257,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Titanium Plant, Emek Hefer",
            "Address": "Alexander River Park",
            "City": "Emek Hefer Regional Council",
            "Latitude": 32.400145,
            "Longitude": 34.89928,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sixth Gear Garage",
            "Address": "HaMakabim 48",
            "City": "Rishon Lezion",
            "Latitude": 31.9814643,
            "Longitude": 34.8102243,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Boulevard Parking Lot - Tiltan 26",
            "Address": "Tiltan 26",
            "City": "Modi'in Maccabim Reut",
            "Latitude": 31.9034313,
            "Longitude": 35.008719,
            "Operator": "AfconEv",
            "Duplicate Count": 6.0
        },
        {
            "Station Name": "Mega Or - Beit Yarden Industrial Park, Shilat",
            "Address": "Beit Yarden",
            "City": "Moshav Shilat",
            "Latitude": 31.915861,
            "Longitude": 35.024483,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Seven Stars Mall, Level 2",
            "Address": "Sderot Sheva HaKochavim 8",
            "City": "Herzliya",
            "Latitude": 32.1650615,
            "Longitude": 34.8239528,
            "Operator": "AfconEv",
            "Duplicate Count": 11.0
        },
        {
            "Station Name": "Rafael Eitan Street, Kiryat Ono",
            "Address": "Yitzhak Rabin 2",
            "City": "Kiryat Ono",
            "Latitude": 32.0663665,
            "Longitude": 34.8617199,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Mega Or Ariel - Lower Parking Lot",
            "Address": "HaBanai",
            "City": "Ariel",
            "Latitude": 32.100425,
            "Longitude": 35.170581,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Azor Nursery, Holon",
            "Address": "Derech HaShiv'a 104",
            "City": "Holon",
            "Latitude": 32.0197037,
            "Longitude": 34.8066714,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Sheraton Hotel, Tel Aviv",
            "Address": "HaYarkon 115",
            "City": "Tel Aviv-Yafo",
            "Latitude": 32.0816839,
            "Longitude": 34.7682212,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Lot Hotel (Hotel Guests Only)",
            "Address": "Ein Bokek 86930",
            "City": "Dead Sea",
            "Latitude": 31.2000249,
            "Longitude": 35.364468,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Kibbutz Ga’aton - Ga’aton",
            "Address": "Kibbutz Ga’aton",
            "City": "Ga'aton",
            "Latitude": 33.005483,
            "Longitude": 35.214036,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Hof HaCarmel",
            "Address": "Ein Carmel",
            "City": "Ein Carmel",
            "Latitude": 32.6766316,
            "Longitude": 34.957936,
            "Operator": "AfconEv",
            "Duplicate Count": 13.0
        },
        {
            "Station Name": "Rabbi Akiva Street 4, Modi’in Illit",
            "Address": "Rabbi Akiva 4",
            "City": "Modi'in Illit",
            "Latitude": 31.9396365,
            "Longitude": 35.0393558,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Avnei Nezer Street 20, Modi’in Illit",
            "Address": "Avnei Nezer 20",
            "City": "Modi'in Illit",
            "Latitude": 31.9344031,
            "Longitude": 35.0417166,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sha’ar HaMelech Street 7, Modi’in Illit",
            "Address": "Sha'ar HaMelech 7",
            "City": "Modi'in Illit",
            "Latitude": 31.9325654,
            "Longitude": 35.0429247,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Maromei HaSade Street 12, Modi’in Illit",
            "Address": "Marome Sadeh 12",
            "City": "Modi'in Illit",
            "Latitude": 31.928541,
            "Longitude": 35.04378,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Rashbam Street 12, Modi’in Illit",
            "Address": "Rashbam 12",
            "City": "Modi'in Illit",
            "Latitude": 31.9332054,
            "Longitude": 35.0536395,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Netivot Shalom Street 18, Modi’in Illit",
            "Address": "Netivot Shalom 18",
            "City": "Modi'in Illit",
            "Latitude": 31.9295987,
            "Longitude": 35.0506474,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ketzot HaChoshen Street 14, Modi’in Illit",
            "Address": "Ketzot HaChoshen 14",
            "City": "Modi'in Illit",
            "Latitude": 31.9279205,
            "Longitude": 35.0409702,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Sha’arei Teshuva Street 1, Modi’in Illit",
            "Address": "Sha'arei Teshuva 1",
            "City": "Modi'in Illit",
            "Latitude": 31.928787,
            "Longitude": 35.0381381,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dan Hotels - Nazareth",
            "Address": "HaGalil 28",
            "City": "Nazareth",
            "Latitude": 32.7050554,
            "Longitude": 35.3048785,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dan Hotels - Ruth Hotel (Hotel Guests Only)",
            "Address": "Taz 1",
            "City": "Safed",
            "Latitude": 32.9641096,
            "Longitude": 35.4941823,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Moriah Street 22, Ramat HaSharon",
            "Address": "Moriah 22",
            "City": "Ramat HaSharon",
            "Latitude": 32.1440961,
            "Longitude": 34.8367404,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Ein HaMifratz Center",
            "Address": "Ein HaMifratz",
            "City": "Ein HaMifratz",
            "Latitude": 32.9005167,
            "Longitude": 35.0922952,
            "Operator": "AfconEv",
            "Duplicate Count": 7.0
        },
        {
            "Station Name": "Cardo Commercial Center, Rishon Lezion",
            "Address": "HaShira HaIvrit 10",
            "City": "Rishon Lezion",
            "Latitude": 31.977847,
            "Longitude": 34.770366,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "HaBar Mall, Rishon Lezion",
            "Address": "Moreshet Yisrael 15",
            "City": "Rishon Lezion",
            "Latitude": 31.9755623,
            "Longitude": 34.7737571,
            "Operator": "AfconEv",
            "Duplicate Count": 3.0
        },
        {
            "Station Name": "Bnei Nehemiah Mall, Kiryat Shmona",
            "Address": "HaNasi 4",
            "City": "Kiryat Shmona",
            "Latitude": 33.221613,
            "Longitude": 35.575622,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Metzoke Dragot",
            "Address": "Mitzpe Shalem",
            "City": "Mitzpe Shalem",
            "Latitude": 31.5908238,
            "Longitude": 35.3935858,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Jack’s Inn - Yasmin Street",
            "Address": "HaYasmin",
            "City": "Beit Nehemia",
            "Latitude": 31.982931,
            "Longitude": 34.953377,
            "Operator": "AfconEv",
            "Duplicate Count": 5.0
        },
        {
            "Station Name": "Hof HaCarmel - Joint School",
            "Address": "Ein Carmel",
            "City": "Ein Carmel / Atlit",
            "Latitude": 32.5524877,
            "Longitude": 34.9106672,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Petanque Park, Ramat HaSharon",
            "Address": "David Ben Gurion",
            "City": "Ramat HaSharon",
            "Latitude": 32.140036,
            "Longitude": 34.8351961,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Dor Alon - Tal Shahar",
            "Address": "Tal Shahar",
            "City": "Tal Shahar",
            "Latitude": 31.80929,
            "Longitude": 34.900193,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Zarzir - Kufta Complex",
            "Address": "Zarzir",
            "City": "Zarzir",
            "Latitude": 32.7335765,
            "Longitude": 35.2176045,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Parking Lot 6 (Authorized Only)",
            "Address": "Atidim Park",
            "City": "Tel Aviv",
            "Latitude": 32.1147683,
            "Longitude": 34.8430154,
            "Operator": "AfconEv",
            "Duplicate Count": 8.0
        },
        {
            "Station Name": "Mesilat Yosef Street 11, Modi’in Illit",
            "Address": "Mesilat Yosef 11",
            "City": "Modi'in Illit",
            "Latitude": 31.9297572,
            "Longitude": 35.0438288,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Kibbutz Yifat",
            "Address": "Rechev Re'em",
            "City": "Kibbutz Yifat",
            "Latitude": 32.6750468,
            "Longitude": 35.221831,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Dan Hotels - Neptune Eilat",
            "Address": "Tarshish 5",
            "City": "Eilat",
            "Latitude": 29.550764,
            "Longitude": 34.956422,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Ben Zion Galis Street 12 - Alexander Yanai 1",
            "Address": "Alexander Yanai 1",
            "City": "Petah Tikva",
            "Latitude": 32.1033793,
            "Longitude": 34.8959676,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Hof HaCarmel Security Center",
            "Address": "Merav Center",
            "City": "Ein Carmel",
            "Latitude": 32.6478308,
            "Longitude": 34.9638205,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "BIG Kastina - Area 2",
            "Address": "Azohat Be’er Tuvia",
            "City": "Be'er Tuvia",
            "Latitude": 31.7288762,
            "Longitude": 34.7556431,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "Physics Building, Weizmann Institute",
            "Address": "Herzl 234",
            "City": "Rehovot",
            "Latitude": 31.9085567,
            "Longitude": 34.8123364,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Knowledge Building, Weizmann Institute",
            "Address": "Herzl 234",
            "City": "Rehovot",
            "Latitude": 31.905287,
            "Longitude": 34.807323,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Weizgal House, Weizmann Institute",
            "Address": "Neve Metz 234",
            "City": "Rehovot",
            "Latitude": 31.906558,
            "Longitude": 34.813447,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Biochemistry Building, Weizmann Institute",
            "Address": "Herzl 234",
            "City": "Rehovot",
            "Latitude": 31.909123,
            "Longitude": 34.809205,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "De Picciotto Building 4, Weizmann Institute",
            "Address": "Sara VeShmuel Gutheilf 234",
            "City": "Rehovot",
            "Latitude": 31.9087591,
            "Longitude": 34.8079933,
            "Operator": "AfconEv",
            "Duplicate Count": 2.0
        },
        {
            "Station Name": "Armon Parking Lot, Haifa",
            "Address": "Y.L. Peretz 27",
            "City": "Haifa",
            "Latitude": 32.8136882,
            "Longitude": 34.9949298,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        },
        {
            "Station Name": "BIG Fashion Nazareth - Upper Parking Lot",
            "Address": "53 Taufiq Ziad",
            "City": "Nazareth",
            "Latitude": 32.695875,
            "Longitude": 35.301205,
            "Operator": "AfconEv",
            "Duplicate Count": 4.0
        }
    ];

async function insertData() {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        const result = await Station.insertMany(stationData);
        console.log(`${result.length} stations inserted successfully`);

    } catch (error) {
        console.error('Error inserting data:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

insertData();
