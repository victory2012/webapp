<template>
  <div>
    <mt-header :title="$t('addDevice.title')">
      <router-link to="/device"
        slot="left">
        <mt-button icon="back">{{$t('addDevice.back')}}</mt-button>
      </router-link>
    </mt-header>
    <div class="forms">
      <ul>
        <li>
          <div class="title">{{$t('addDevice.deviceCode')}}</div>
          <div>
            <input v-model="deviceId"
              type="text">
          </div>
        </li>
        <li>
          <div class="title">{{$t('addDevice.manufacturer')}}</div>
          <div @click="chooseMani">
            {{manufacturer.name}}
          </div>
        </li>
        <li>
          <div class="title">{{$t('addDevice.Customer')}}</div>
          <div @click="chooseCustomr">
            {{customerValu.name}}
          </div>
        </li>
      </ul>
      <button @click="creatDevice"
        class="creatBtn">{{$t('addDevice.createBtn')}}</button>
    </div>
    <mt-popup v-model="popupVisible"
      class="popup"
      position="bottom">
      <mt-picker :slots="manu"
        @change="onValuesChange"
        valueKey="name"
        :show-toolbar="true">
        <div class="mint-datetime-action mint-datetime-cancel"
          @click.stop="Manicancel">{{$t('timeBtn.cancle')}}</div>
        <!-- 确定 -->
        <div class="mint-datetime-action mint-datetime-confirm"
          @click="ManisureBtn">{{$t('timeBtn.sure')}}</div>
      </mt-picker>
    </mt-popup>
    <mt-popup v-model="CusVisible"
      class="popup"
      position="bottom">
      <mt-picker :slots="customer"
        valueKey="name"
        @change="CusVisibleChange"
        :show-toolbar="true">
        <!-- 取消 -->
        <div class="mint-datetime-action mint-datetime-cancel"
          @click.stop="cancel">{{$t('timeBtn.cancle')}}</div>
        <!-- 确定 -->
        <div class="mint-datetime-action mint-datetime-confirm"
          @click="sureBtn">{{$t('timeBtn.sure')}}</div>
      </mt-picker>
    </mt-popup>
  </div>
</template>
<script>
import { Header, Field, Popup, Picker } from "mint-ui";
import {
  createDeviceList,
  enterpriseList,
  enterpriseCustomer
} from "../../api/index";
import { onError, onSuccess } from "../../utils/callback";

export default {
  components: {
    "mt-header": Header,
    "mt-field": Field,
    "mt-popup": Popup,
    "mt-picker": Picker
  },
  data () {
    return {
      device: {},
      CusVisible: false,
      popupVisible: false,
      manufacturer: {
        name: this.$t('addDevice.manufacturerWarn'),
        id: ''
      },
      customerValu: {
        name: this.$t('addDevice.CustomerWarn'),
        id: ''
      },
      deviceId: "",
      manufacturerOptions: {},
      chooseObj: {},
      customerOptions: {},
      manu: [
        {
          values: []
        }
      ],
      customer: [
        {
          values: []
        }
      ]
    };
  },
  mounted () {
    this.getAddData();
  },
  methods: {
    Manicancel () {
      this.chooseObj = {};
      this.popupVisible = false;
    },
    ManisureBtn () {
      this.manufacturer = this.chooseObj;
      this.popupVisible = false;
    },
    cancel () {
      this.CusVisible = false;
    },
    sureBtn () {
      this.chooseCus = this.chooseCus;
      this.CusVisible = false;
    },
    onValuesChange (picker, value) {
      // this.manufacturer = value[0];
      this.chooseObj = value[0];
    },
    CusVisibleChange (picker, value) {
      // this.customerValu = value[0];
      this.chooseCus = value[0];
    },
    chooseMani () {
      this.popupVisible = !this.popupVisible;
    },
    chooseCustomr () {
      this.CusVisible = !this.CusVisible;
    },
    getAddData () {
      // 生产企业列表
      enterpriseList().then(res => {
        if (res.data && res.data.code === 0) {
          let result = res.data.data;
          this.manu[0].values = [];
          if (result.length > 0) {
            result.forEach(key => {
              this.manu[0].values.push(key);
            });
          } else {
            this.manu[0].values.push({
              name: `${this.$t("addDevice.noData")}`,
              id: ''
            });
          }
        }
      });
      enterpriseCustomer()
        // 客户企业列表
        .then(res => {
          if (res.data && res.data.code === 0) {
            let data = res.data.data;
            this.customer[0].values = [];
            if (data.length > 0) {
              data.forEach(key => {
                this.customer[0].values.push(key.name);
              });
            } else {
              this.customer[0].values.push({
                name: `${this.$t("addDevice.noData")}`,
                id: ''
              });
            }
          }
        });
    },
    creatDevice () {
      let manufacturerName;
      let customerName;
      if (!this.manufacturer.id) {
        manufacturerName = "";
      } else {
        manufacturerName = this.manufacturer.name;
      }
      if (!this.customerValu.id) {
        customerName = "";
      } else {
        customerName = this.customerValu.name;
      }
      let params = {
        manufacturerId: this.manufacturer.id || '',
        customerId: this.customerValu.id || '',
        deviceId: this.deviceId,
        manufacturerName: manufacturerName,
        customerName: customerName
      };
      console.log(params);
      if (!this.deviceId) {
        onError(`${this.$t("addDevice.errorTip")}`);
        return;
      }
      createDeviceList(params).then(res => {
        console.log(res);
        if (res.data && res.data.code === 0) {
          onSuccess(`${this.$t("addDevice.success")}`);
          this.deviceId = "";
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
@import url('../../common/style/index.scss');
.mint-header {
  background: #ffffff;
  color: #394750;
  border-bottom: 1px solid #e5e5e5;
}
.forms {
  padding: px2rem(80px) px2rem(20px) 0;
  font-size: px2rem(14px);
  .creatBtn {
    display: block;
    width: 100%;
    height: 40px;
    background: #26a2ff;
    color: #ffffff;
    border-radius: 3px;
    margin: px2rem(40px) auto;
  }
  li {
    display: flex;
    height: px2rem(50px);
    line-height: px2rem(50px);
    border-bottom: 1px dashed #9b9b9b;
    div {
      flex: 1;
      input {
        height: px2rem(30px);
        background: #f2f2f2;
        color: #394750;
        width: 80%;
        border-radius: 3px;
        text-indent: 1em;
      }
      &.title {
        flex: 0 0 120px;
      }
    }
  }
}
.popup {
  width: 100vw;
}
</style>
