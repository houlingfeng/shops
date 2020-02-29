<template>
    <div>
        <!--面包屑导航区域-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>

         <!--卡片视图区域-->
         <el-card>
            <el-row>
                <el-col :span="8">
                    <el-input placeholder="请输入内容">
                        <el-button slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                </el-col>
            </el-row>

            <!--订单列表数据-->
            <el-table :data="orderlist" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="订单编号" prop="order_number" width="200px"></el-table-column>
                <el-table-column label="订单价格" prop="order_price"></el-table-column>
                <el-table-column label="是否付款" prop="order_pay">
                    <template slot-scope="scope">
                        <el-tag type="success" v-if="scope.row.order_pay === '1'">已付款</el-tag>
                        <el-tag type="danger" v-else>未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send"></el-table-column>
                <el-table-column label="下单时间" prop="create_time">
                    <template slot-scope="scope">
                        {{scope.row.create_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox(scope.row.order_id)"></el-button>
                        <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!--分页区域-->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
         </el-card>

        <!--修改订单的对话框-->
        <el-dialog title="修改订单" :visible.sync="addressVisible" width="50%" @close="addressDialogClosed">
            <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
                <el-form-item label="订单编号">
                    <el-input v-model="addressForm.order_number" disabled></el-input>
                </el-form-item>
                <el-form-item label="订单价格" prop="order_price">
                    <el-input v-model="addressForm.order_price" type="number"></el-input>
                </el-form-item>
                <el-form-item label="是否付款" prop="order_pay">
                    <el-input v-model="addressForm.order_pay"></el-input>
                </el-form-item>
                <el-form-item label="是否发货">
                    <el-input v-model="addressForm.is_send"></el-input>
                </el-form-item>
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader :options="cityData" v-model="addressForm.address1"></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="addressForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addressVisible = false">取消</el-button>
                <el-button type="primary" @click="orderadd">确定</el-button>
            </span>
        </el-dialog>

        <!--展示物流的对话框-->
        <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
            <!--timeline时间线-->
            <el-timeline>
                <el-timeline-item v-for="(activity, index) in progressInfo" :key="index" :timestamp="activity.time">{{activity.context}}</el-timeline-item>
            </el-timeline>
        </el-dialog>
    </div>
</template>

<script>
    import cityData from './citydata.js'
    export default{
        data(){
            var checkSend = (rule, value, cb) => {
                //验证邮箱的正则
                const regsend = /^[01]$/
                if(regsend.test(value)){
                    //合法
                    return cb()
                }
                cb(new Error('请输入0或者1'))
            }
            return{
                queryInfo: {
                    query: '',
                    pagenum: 1,
                    pagesize: 10
                },
                total: 0,
                orderlist: [],
                addressVisible: false,
                addressForm: {
                    address1: [],
                    address2: '',
                    order_price: '',
                    order_number: '',
                    order_pay: '',
                    is_send: '',
                    order_id: ''
                },
                addressFormRules: {
                    address1:[{required: true, message: '请选择省市区/县', trigger: 'blur'}],
                    address2:[{required: true, message: '请填写详细地址', trigger: 'blur'}],
                    order_price: [{required: true, message: '请输入订单价格', trigger: 'blur'}],
                    order_pay: [{required: true, message: '请输入0或者1', trigger: 'blur'},
                        {validator: checkSend, trigger: 'blur'}]
                },
                cityData,
                progressVisible: false,
                progressInfo: []

            }

        },
        
        created(){
            this.getOrderList()
        },
        methods: {
            async getOrderList(){
                const {data: res}= await this.$http.get('orders', {params: this.queryInfo})
                if(res.meta.status !== 200){
                    return this.$message.error('获取失败')
                }
                this.$message.success('获取成功')
                this.total = res.data.total
                this.orderlist = res.data.goods
                console.log(this.orderlist)
            },
            handleSizeChange(newSize){
                this.queryInfo.pagesize = newSize
                this.getOrderList()
            },
            handleCurrentChange(newPage){
                this.queryInfo.pagenum = newPage
                this.getOrderList()
            },


            //展示修改地址的对话框
            async showBox(id){
                console.log(id)
                const {data: res} = await this.$http.get('orders/' + id)
                if(res.meta.status !== 200){
                    return this.$message.error('获取失败')
                }
                this.$message.success('获取成功')
                this.addressForm.order_number = res.data.order_number
                this.addressForm.order_price = res.data.order_price
                this.addressForm.is_send = res.data.is_send
                this.addressForm.order_pay = res.data.order_pay
                this.addressForm.order_id = res.data.order_id
                console.log(this.addressForm)
                console.log(res.data)
                this.addressVisible = true
                
            },
            addressDialogClosed(){
                this.$refs.addressFormRef.resetFields()
            },
            async showProgressBox(){
                const {data: res} = await this.$http.get('/kuaidi/1106975712662')
                if(res.meta.status !== 200){
                    return this.$message.error('获取失败')
                }
                this.progressInfo = res.data
                this.progressVisible = true
                console.log(this.progressInfo)
            },
            orderadd(){
                this.$refs.addressFormRef.validate(async valid => {
                    if(!valid) return
                    const {data: res}= await this.$http.put('orders/' + this.addressForm.order_id, {
                        order_price: this.addressForm.order_price,
                        is_send: this.addressForm.is_send,
                        order_pay: this.addressForm.order_pay
                    })
                    if(res.meta.status !== 201){
                        return this.$message.error('修改失败')
                    }
                    this.$message.success('修改成功')
                    console.log(res)
                    this.getOrderList()
                    this.addressVisible = false
                })
            }

        }

    }
    
</script>

<style lang="less" scoped>
    .el-cascader{
        width: 100%;
    }
</style>