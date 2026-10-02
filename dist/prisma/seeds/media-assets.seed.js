"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMAGE_URLS = void 0;
exports.seedMediaAssets = seedMediaAssets;
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({ adapter });
exports.IMAGE_URLS = [
    'https://images.pexels.com/photos/2166936/pexels-photo-2166936.jpeg',
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&q=80',
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&q=80',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=500&q=70',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&q=70',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&q=80',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=70',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&q=80',
    'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?auto=format&fit=crop&w=1100&q=80',
    'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=600&q=80',
    'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800&q=80',
    'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400&q=80',
    'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&q=70',
    'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80',
    'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&q=80',
    'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=600&q=80',
    'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=800&q=80',
    'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=1200&q=80',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80',
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=70',
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80',
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505222011126-27b25b337dce?w=800&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
    'https://images.unsplash.com/photo-1512453979798-5ea904ac66de?w=800&q=80',
    'https://images.unsplash.com/photo-1512453979798-5ea904ac66de?w=1200&q=80',
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80',
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80',
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80',
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1600&q=80',
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&q=80',
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=500&q=70',
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=70',
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=70',
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80',
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=80',
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1100&q=80',
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233',
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&q=70',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=70',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=70',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80',
    'https://images.unsplash.com/photo-1523800503107-5bc3ba2a6f81?w=800&q=80',
    'https://images.unsplash.com/photo-1534234828563-02511c750b53?w=400&q=80',
    'https://images.unsplash.com/photo-1534234828563-02511c750b53?w=800&q=80',
    'https://images.unsplash.com/photo-1534234828563-02511c750b53?w=1200&q=80',
    'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1100&q=80',
    'https://images.unsplash.com/photo-1534759846116-5799c33ce22a?w=600&q=70',
    'https://images.unsplash.com/photo-1534759846116-5799c33ce22a?w=800&q=80',
    'https://images.unsplash.com/photo-1534759846116-5799c33ce22a?w=1200&q=80',
    'https://images.unsplash.com/photo-1540206395-688085723adb?w=600&q=70',
    'https://images.unsplash.com/photo-1540206395-688085723adb?w=800&q=80',
    'https://images.unsplash.com/photo-1540206395-688085723adb?w=1200&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&q=70',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=70',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1100&q=80',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80',
    'https://images.unsplash.com/photo-1544620347-f4fd8749f24e?w=400&q=80',
    'https://images.unsplash.com/photo-1544620347-f4fd8749f24e?w=800&q=80',
    'https://images.unsplash.com/photo-1546703565-373809930f78?w=600&q=80',
    'https://images.unsplash.com/photo-1546703565-373809930f78?w=800&q=80',
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&q=80',
    'https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=1100&q=80',
    'https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500&q=70',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=70',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80',
    'https://images.unsplash.com/photo-1559336194-973ee0c45b4b?w=800&q=80',
    'https://images.unsplash.com/photo-1559336194-973ee0c45b4b?w=1200&q=80',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=70',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=70',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
    'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80',
    'https://images.unsplash.com/photo-1570125909232-eb2be79ff63d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1570125909232-eb2be79ff63d?auto=format&fit=crop&w=1100&q=80',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80',
    'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=800&q=80',
    'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=1200&q=80',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=70',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80',
    'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80',
    'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80',
    'https://images.unsplash.com/photo-1580747182610-dac5e078f8f5?w=800&q=80',
    'https://images.unsplash.com/photo-1580747182610-dac5e078f8f5?w=1200&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600&q=80',
    'https://images.unsplash.com/photo-1582967788606-a171f1080ca8?w=800&q=80',
    'https://images.unsplash.com/photo-1582967788606-a171f1080ca8?w=1200&q=80',
    'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=500&q=70',
    'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=800&q=80',
    'https://images.unsplash.com/photo-1589979481223-deb893043163?w=800&q=80',
    'https://images.unsplash.com/photo-1589979481223-deb893043163?w=1200&q=80',
    'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=800&q=80',
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=500&q=70',
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&q=80',
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=70',
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80',
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80',
];
function inferCategory(url) {
    if (url.includes('pexels'))
        return 'NATURE';
    if (url.includes('1534430480872') || url.includes('1544620347') || url.includes('1547721064') || url.includes('1570125909232')) {
        return 'TRANSPORT';
    }
    if (url.includes('1544551763') || url.includes('1504280390') || url.includes('1516426122') || url.includes('1559336194') || url.includes('1559526324') || url.includes('1559827260') || url.includes('1577083552') || url.includes('1589979481')) {
        return 'EXPERIENCE';
    }
    if (url.includes('1474511320') || url.includes('1500076656') || url.includes('1516026672') || url.includes('1523800503') || url.includes('1540206395') || url.includes('1546703565') || url.includes('1547471080') || url.includes('1580060839') || url.includes('1580747182') || url.includes('1582967788') || url.includes('1591696205')) {
        return 'NATURE';
    }
    if (url.includes('1507003211'))
        return 'AVATAR';
    return 'STAY';
}
function inferSource(url) {
    if (url.includes('pexels.com'))
        return 'PEXELS';
    return 'UNSPLASH';
}
async function seedMediaAssets() {
    const uniqueUrls = Array.from(new Set(exports.IMAGE_URLS));
    console.log(`Starting seed for ${uniqueUrls.length} unique image URLs...`);
    let insertedCount = 0;
    for (const url of uniqueUrls) {
        const category = inferCategory(url);
        const source = inferSource(url);
        await prisma.mediaAsset.upsert({
            where: { url },
            update: { category, source },
            create: {
                url,
                category,
                source,
                caption: `Sample ${category.toLowerCase()} asset`,
            },
        });
        insertedCount++;
    }
    console.log(`Successfully seeded ${insertedCount} media assets in database.`);
}
async function main() {
    await seedMediaAssets();
}
if (require.main === module) {
    main()
        .catch((e) => {
        console.error('Error seeding media assets:', e);
        process.exit(1);
    })
        .finally(() => prisma.$disconnect());
}
//# sourceMappingURL=media-assets.seed.js.map