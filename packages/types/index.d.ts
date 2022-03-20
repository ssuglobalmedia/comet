/* Response */
export type CometResponse = {
  success: boolean;
  // eslint-disable-next-line
  result?: any;
  error?: number;
  error_description?: string;
};

/* Module */

export type ModuleDao = {
  module: { S: string };
  dataId: { S: string };
};

/* Auth Module */
export type UserDao = {
  userName: { S: string };
  userGroup: { S: string };
  lastSemester?: { N: string };
  phone?: { S: string };
} & ModuleDao;

export type User = {
  userId: string;
  userName: string;
  userGroup: string;
  lastSemester?: string;
  phone?: string;
};

export type RentStatus = {
  userId: string,
  until: string,
  amount: number
}

export type RentStatusDao = {
  uI: { S: string },
  u: {  S: string },
  a: {  N: string }
}

export type Rental = {
  name: string,
  category: string,
  amount: number,
  rentStatus: [RentStatus]
}

export type RentalDao = {
  n: { S: string },
  c: { S: string },
  a: { N: string },
  rS: [RentStatusDao]
}

export type RentalList = {
  categories: {
    [id: string]: string
  },
  rentals: {
    [id: string]: Rental
  }
}

export type RentalListDao = {
  c: {
    [id: string]: { S: string }
  },
  r: {
    [id: string]: RentalDao
  }
}
