"use server";
import { db } from "@/lib/db";

function buildWhereClause(columnFilters?: any[]) {
    const where: Record<string, any> = {};

    // Apply column filters
    if (columnFilters && columnFilters.length > 0) {
        columnFilters.forEach((filter) => {
            const { id, value } = filter;
            if (value === undefined || value === null || value === "" || value === "All") return;

            switch (id) {
                case "status":
                    where[id] = { equals: value };
                    break;
                case "cooperative_id":
                    where[id] = { equals: BigInt(value) };
                    break;
                case "created_at":
                    const now = new Date();
                    let startDate = new Date();
                    if (value === "Today") {
                        startDate.setHours(0, 0, 0, 0);
                    } else if (value === "This week") {
                        startDate.setDate(now.getDate() - now.getDay());
                        startDate.setHours(0, 0, 0, 0);
                    } else if (value === "This month") {
                        startDate.setDate(1);
                        startDate.setHours(0, 0, 0, 0);
                    } else if (value === "This year") {
                        startDate.setMonth(0, 1);
                        startDate.setHours(0, 0, 0, 0);
                    } else {
                        break;
                    }
                    where[id] = { gte: startDate };
                    break;
                case "applicant_name_en":
                    where.OR = [
                        { applicant_name_en: { contains: value } },
                        { applicant_phone: { contains: value } }
                    ];
                    break;
                case "applicant_phone":
                    where[id] = { contains: value };
                    break;
                default:
                    where[id] = { contains: value };
            }
        });
    }
    return where;
}

export async function getApplicants(
    pagination?: { pageIndex: number; pageSize: number },
    sorting?: { id: string; desc: boolean }[],
    //   columnFilters?: { id: string; value: string }[]
    columnFilters?: any[]
) {
    const where = buildWhereClause(columnFilters);

    // Sorting
    const orderBy = sorting
        ? sorting.map(({ id, desc }) => ({
            [id]: desc ? "desc" : "asc",
        }))
        : undefined;

    // Pagination
    const skip = pagination
        ? pagination.pageIndex * pagination.pageSize
        : undefined;
    const take = pagination ? pagination.pageSize : undefined;

    const [data, count] = await Promise.all([
        db.applicants_applicant.findMany({
            where,
            orderBy,
            skip,
            take,
            include: {
                applicants_applicantapartment: true,
                applicants_applicantdocument: true,
                applicants_applicantfixedsaving: true,
                applicants_applicantgovloan: true,
                applicants_applicantinvestment: true,
                applicants_applicantmortgageinvestment: true,
                applicants_applicantorginvestment: true,
                applicants_applicantorgmortgageinvestment: true,
                applicants_applicantotherdue: true,
                applicants_applicantsaving: true,
                applicants_applicantshare: true,
                cooperatives_branch: true,
                cooperatives_cooperative: true,
                locations_state: true,
                locations_district_applicants_applicant_c_district_id_idTolocations_district: true,
                locations_district_applicants_applicant_p_district_id_idTolocations_district: true,
                locations_municipality: true,
            },
        }),
        db.applicants_applicant.count({ where }),
    ]);


    return { data: data, count };
}

export async function getAllApplicantsForExport(columnFilters?: any[]) {
    const where = buildWhereClause(columnFilters);

    const data = await db.applicants_applicant.findMany({
        where,
        include: {
            applicants_applicantapartment: true,
            applicants_applicantdocument: true,
            applicants_applicantfixedsaving: true,
            applicants_applicantgovloan: true,
            applicants_applicantinvestment: true,
            applicants_applicantmortgageinvestment: true,
            applicants_applicantorginvestment: true,
            applicants_applicantorgmortgageinvestment: true,
            applicants_applicantotherdue: true,
            applicants_applicantsaving: true,
            applicants_applicantshare: true,
            cooperatives_branch: true,
            cooperatives_cooperative: true,
            locations_state: true,
            locations_district_applicants_applicant_c_district_id_idTolocations_district: true,
            locations_district_applicants_applicant_p_district_id_idTolocations_district: true,
            locations_municipality: true,
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    return data;
}
