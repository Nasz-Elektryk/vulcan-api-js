import dateFormat from "dateformat";
import { Api } from "./api";
import {
  DATA_BY_PERIOD,
  DATA_BY_PERSON,
  DATA_BY_PUPIL,
  DATA_ROOT,
} from "./endpoints";
import { Account } from "./models";
import { Period } from "./models";
import { Student } from "./models";

export enum FilterType {
  BY_PUPIL = 0,
  BY_PERSON = 1,
  BY_PERIOD = 2,
}

export const getEndpoint = (type: FilterType) => {
  switch (type) {
    case FilterType.BY_PUPIL:
      return DATA_BY_PUPIL;
    case FilterType.BY_PERSON:
      return DATA_BY_PERSON;
    case FilterType.BY_PERIOD:
      return DATA_BY_PERIOD;
    default:
      return null;
  }
};

export class ApiHelper {
  private api: Api;

  constructor(api: Api) {
    this.api = api;
  }

  public async getList(
    endpoint: string,
    deleted: boolean,
    lastSync?: Date,
    dateFrom?: Date,
    dateTo?: Date,
    filterType?: FilterType,
    params?: any
  ) {
    let url = "";
    if (!this.api) {
      throw Error("You must select a student!");
    }
    if (deleted) {
      throw Error("Getting deleted data IDs is not implemented yet.");
    }
    if (filterType !== undefined) {
      url = `${DATA_ROOT}/${endpoint}/${getEndpoint(filterType)}`;
    } else {
      url = `${DATA_ROOT}/${endpoint}`;
    }
    let query: any = {};
    const account: Account = this.api.account;
    const student: Student = this.api.student;
    const period: Period = this.api.period;
    switch (filterType) {
      case FilterType.BY_PUPIL:
        query["unitId"] = student.unit.id;
        query["pupilId"] = student.pupil.id;
        query["periodId"] = period.id;
        break;
      case FilterType.BY_PERSON:
        query["loginId"] = account.loginId;
        break;
      case FilterType.BY_PERIOD:
        query["periodId"] = period.id;
        query["pupilId"] = student.pupil.id;
        break;
      default:
        break;
    }
    if (dateFrom) {
      query["dateFrom"] = dateFormat(dateFrom, "yyyy-mm-dd");
    }
    if (dateTo) {
      query["dateTo"] = dateFormat(dateTo, "yyyy-mm-dd");
    }
    query["lastId"] = "-2147483648"; // Comment from vulcan-api for python: don't ask, it's just Vulcan
    query["pageSize"] = 500;
    query["lastSyncDate"] = dateFormat(
      lastSync || new Date("1970"),
      "yyyy-mm-dd HH:MM:ss"
    );

    if (params) {
      query = { ...query, ...params };
    }

    return await this.api.get(url, query);
  }

  public async getData(endpoint: string, query?: any) {
    const url = `${DATA_ROOT}/${endpoint}`;
    return await this.api.get(url, query);
  }
}
