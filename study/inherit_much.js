// 三层以上的继承关系
// 调用子孙类调用爷爷类的成员
var Model = function() {
    this.names = ["name1", "name2"];
}

var Item = function() {
    // when inheriting in javascript you must
    // call the inherited function's constructor manually
    Model.call(this);
}

// inherit Model's prototype so you get all of Model's methods
Item.prototype = Object.create(Model.prototype);
Item.prototype.constructor = Item;

Item.prototype.init = function(item_name) {
    this.names[0] = item_name;
}

var Employee = function() {
    Model.call(this);
}

Employee.prototype = Object.create(Model.prototype);
Employee.prototype.constructor = Employee;

var Manager = function() {
    Employee.call(this);
}
Manager.prototype = Object.create(Employee.prototype);
Manager.prototype.constructor = Manager;

var myItem = new Item();
myItem.init('name3');
console.log('item: ', myItem.names);

var employee = new Employee();
console.log('employee: ', employee.names);

var manager = new Manager();
console.log('manager: ', manager.names);
