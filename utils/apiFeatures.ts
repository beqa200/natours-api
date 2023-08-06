import { SortOrder } from "mongoose";

class APIFeatures {
    query: any;
    queryString: any;
    constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
    }
  
    filter() {
      const queryObj = { ...this.queryString };
      const excludedFields = ['page', 'sort', 'limit', 'fields'];
      excludedFields.forEach((el) => delete queryObj[el]);
  
      // Advanced filtering
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  
      this.query.find(JSON.parse(queryStr));
  
      return this;
    }
  
    sort() {
      if (this.queryString.sort) {
        let sortValue:
          | string
          | { [key: string]: SortOrder }
          | [string, SortOrder][] = this.queryString.sort as string;
  
        sortValue = sortValue.split(',').join(' ');
  
        if (typeof sortValue !== 'string') {
          sortValue = sortValue as
            | { [key: string]: SortOrder }
            | [string, SortOrder][];
        }
  
        this.query = this.query.sort(sortValue);
      } else {
        this.query = this.query.sort('-createdAt');
      }
      return this;
    }
  
    limitFields() {
      if (this.queryString.fields) {
        const fieldsValue = this.queryString.fields as String;
        const fields = fieldsValue.split(',').join(' ');
  
        this.query = this.query.select(fields);
      }
  
      return this;
    }
  
    paginate() {
      const page = parseFloat(this.queryString.page as string) || 1;
      const limit = parseFloat(this.queryString.limit as string) || 1;
      const skip = (page - 1) * limit;
  
      this.query = this.query.skip(skip).limit(limit);
  
      return this;
    }
  }

  export default APIFeatures;