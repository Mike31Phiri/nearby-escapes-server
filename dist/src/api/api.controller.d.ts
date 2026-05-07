export declare class ApiController {
    getAllEndpoints(): {
        auth: {
            method: string;
            path: string;
            auth: boolean;
        }[];
        users: {
            method: string;
            path: string;
            auth: boolean;
        }[];
        stays: ({
            method: string;
            path: string;
            auth: boolean;
            query: string[];
        } | {
            method: string;
            path: string;
            auth: boolean;
            query?: undefined;
        })[];
        bookings: ({
            method: string;
            path: string;
            auth: boolean;
            roles?: undefined;
        } | {
            method: string;
            path: string;
            auth: boolean;
            roles: string[];
        })[];
        payments: ({
            method: string;
            path: string;
            auth: boolean;
            roles: string[];
        } | {
            method: string;
            path: string;
            auth: boolean;
            roles?: undefined;
        })[];
        host: {
            method: string;
            path: string;
            auth: boolean;
            roles: string[];
        }[];
        collections: {
            method: string;
            path: string;
            auth: boolean;
        }[];
        feedback: {
            method: string;
            path: string;
            auth: boolean;
        }[];
        inbox: {
            method: string;
            path: string;
            auth: boolean;
        }[];
        hosts: {
            method: string;
            path: string;
            auth: boolean;
        }[];
        accommodations: ({
            method: string;
            path: string;
            auth: boolean;
            roles?: undefined;
        } | {
            method: string;
            path: string;
            auth: boolean;
            roles: string[];
        })[];
        buses: ({
            method: string;
            path: string;
            auth: boolean;
            roles?: undefined;
        } | {
            method: string;
            path: string;
            auth: boolean;
            roles: string[];
        })[];
        attractions: ({
            method: string;
            path: string;
            auth: boolean;
            roles?: undefined;
        } | {
            method: string;
            path: string;
            auth: boolean;
            roles: string[];
        })[];
        packages: ({
            method: string;
            path: string;
            auth: boolean;
            roles?: undefined;
        } | {
            method: string;
            path: string;
            auth: boolean;
            roles: string[];
        })[];
        popular: ({
            method: string;
            path: string;
            auth: boolean;
            roles?: undefined;
        } | {
            method: string;
            path: string;
            auth: boolean;
            roles: string[];
        })[];
        uploads: {
            method: string;
            path: string;
            auth: boolean;
            roles: string[];
        }[];
        recommendations: {
            method: string;
            path: string;
            auth: boolean;
        }[];
        admin: {
            method: string;
            path: string;
            auth: boolean;
            roles: string[];
        }[];
    };
}
