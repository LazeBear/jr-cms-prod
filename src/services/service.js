class Service {
  constructor(Model) {
    this.Model = Model;
  }

  async countAll() {
    const count = await this.Model.find().countDocuments();
    return count;
  }

  async getOne(id) {
    return this.Model.findById(id);
  }

  async getAll(pagination, sort, search) {
    const { page, pageSize } = pagination;
    let query;
    if (search) {
      query = this.Model.searchQuery(pagination, sort, search);  
    } else {
      query = this.Model.find();
      query = query.sort(sort);
      query = query.skip((page - 1) * pageSize).limit(pageSize);
    }
    return query;
  }

  async countAllBySearch(search) {
    let query, count;

    if (search) {
      query = await this.Model.searchByKeyword(search);
      count = query.length;
    } else {
      query = this.Model.find();
      count = await this.Model.countDocuments(query);
    }  

    return count;
  }

  // populate should be an object like this {key1: selected_field, k2: s_f}
  async getOneWithPopulate(id, populate) {
    let query = this.Model.findById(id);
    if (populate) {
      Object.keys(populate).forEach(k => {
        const v = populate[k];
        if (v) {
          query = query.populate(k, v);
        } else {
          query = query.populate(k);
        }
      });
    }
    return query;
  }

  async createOne(fields) {
    const document = new this.Model(fields);
    await document.save();
    return document;
  }

  // fields -> field to be updated
  async updateOne(id, fields) {
    return this.Model.findByIdAndUpdate(id, fields, {
      new: true,
      runValidators: true
    });
  }

  async deleteOne(id) {
    return this.Model.findByIdAndDelete(id);
  }
}

module.exports = Service;
