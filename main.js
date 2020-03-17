var eventBus = new Vue()

Vue.component('product', {
  props: {
    premium: {
      type: Boolean,
      required: true
    }
  },
  template: `
    <div class="product">
      <div class="product-image">
        <img :src="image" alt="">
      </div>
      <div class="product-info">
        <h1><a :href="href">{{ title }}</a></h1>
        <p>{{ desc }}</p>
        <p v-if="inStock">In Stock</p>
        <p v-else
           :class="{outOfStock: !inStock}">Out of Stock</p>
        <p>{{ sale }}</p>
        <p>User is premium: {{ premium }}</p>
        <p>Shipping: {{ shipping }}</p>

        <ul>
          <li v-for="detail in details">{{ detail }}</li>
        </ul>

        <div v-for="(variant, index) in variants"
             :key="variant.variantId"
             class="color-box"
             :style="{ backgroundColor: variant.variantColor }"
             @mouseover="updateProduct(index)">
        </div>

        <div v-for="size in sizes" :key="size.sizeId">
          <p>{{ size.sizeLabel }}</p>
        </div>

        <button v-on:click="addToCart"
                :disabled="!inStock"
                :class="{disabledButton: !inStock}">Add to Cart</button>
        <button v-on:click="outOfCart">Remove</button>
      </div>

      <productTabs :reviews="reviews"></productTabs>

    </div>
  `,
  data() {
    return {
      brand: 'Vue Mastery',
      name: 'Socks',
      desc: 'Vue logo socks',
      qty: 99,
      selectedVariant: 0,
      href: 'https://ipecho.net/plain',
      details: ["80% coton", "20% polyester", "Gender-neutral"],
      onSale: true,
      variants: [
        {
          variantId: 2234,
          variantColor: "green",
          variantImage: './assets/vmSocks-green.jpg',
          variantQty: 10
        },
        {
          variantId: 2235,
          variantColor: "blue",
          variantImage: './assets/vmSocks-blue.jpg',
          variantQty: 0
        }
      ],
      sizes: [
        {
          sizeId: 3301,
          sizeLabel: "small"
        },
        {
          sizeId: 3302,
          sizeLabel: "medium"
        },
        {
          sizeId: 3303,
          sizeLabel: "large"
        }
      ],
      reviews: []
    }
  },
  methods: {
    addToCart() {
      this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
    },
    outOfCart() {
      this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId)
    },
    updateProduct(index) {
      this.selectedVariant = index
      console.log(index)
    }
  },
  computed: {
    title() {
      return this.brand + ' ' + this.name
    },
    image() {
      return this.variants[this.selectedVariant].variantImage
    },
    inStock() {
      return this.variants[this.selectedVariant].variantQty
    },
    sale() {
      if(this.onSale)
        return this.brand + ' ' + this.name + ' are on sale!'
      else
        return this.brand + ' ' + this.name + ' are not on sale'
    },
    shipping() {
      if(this.premium) {
        return "Free"
      }
      return 2.99
    }
  },
  mounted() {
    eventBus.$on('review-submitted', productReview => {
      this.reviews.push(productReview)
    })
  }
})

Vue.component('productDetails', {
  props: {
    details: {
      type: Array,
      required: true
    }
  },
  template: `
    <ul>
      <li v-for="detail in details">{{ detail }}</li>
    </ul>
  `
})

Vue.component('productReview', {
  template: `
    <form class="review-form" @submit.prevent="onSubmit">
    <p v-if="errors.length">
      <b>Please correct the following error(s):</b>
      <ul>
        <li v-for="error in errors">{{ error }}</li>
      </ul>
    </p>
    <p>
      <label for="name">Name:</label>
      <input id="name" v-model="name">
    </p>

    <p>
      <label for="review">Review:</label>
      <textarea id="review" v-model="review"></textarea>
    </p>

    <p>
      <label for="rating">Rating:</label>
      <select id="rating" v-model.number="rating">
        <option>5</option>
        <option>4</option>
        <option>3</option>
        <option>2</option>
        <option>1</option>
      </select>
    </p>

    <p>Whould you recommend this product?</p>
    <label> Yes <input type="radio" value="yes" v-model="recommend"/>
    </label>
    <label> No <input type="radio" value="no" v-model="recommend"/>
    </label>

    <p>
      <input type="submit" value="Submit">
    </p>
    </form>
  `,
  data() {
    return {
      name: null,
      review: null,
      rating: null,
      recommend: null,
      errors: []
    }
  },
  methods: {
    onSubmit() {
      if(this.name && this.review && this.rating && this.recommend) {
        let productReview = {
          name: this.name,
          review: this.review,
          rating: this.rating,
          recommend: this.recommend
        }
        eventBus.$emit('review-submitted', productReview)
        this.name = null
        this.review = null
        this.rating = null
        this.recommend = null
      } else {
        if(!this.name) this.errors.push("Name required")
        if(!this.review) this.errors.push("Review required")
        if(!this.rating) this.errors.push("Rating required")
        if(!this.recommend) this.errors.push("Recommendation required")
      }

    }
  }
})

Vue.component('productTabs', {
  props: {
    reviews: {
      type: Array,
      required: true
    }
  },
  template: `
    <div>
      <span class="tab"
            :class="{ activeTab: selectedTab === tab }"
            v-for="(tab,index) in tabs"
            :key="index"
            @click="selectedTab = tab">
            {{ tab }}</span>

      <div v-show="selectedTab === 'Reviews'">
        <p v-if="!reviews.length">There are no reviews yet.</p>
        <ul>
          <li v-for="review in reviews">
            <p>{{ review.name }}</p>
            <p>Rating: {{ review.rating }}</p>
            <p>{{ review.review }}</p>
          </li>
        </ul>
      </div>

      <productReview v-show="selectedTab === 'Make a Review'">
      </productReview>
    </div>
  `,
  data() {
    return {
      tabs: ['Reviews', 'Make a Review'],
      selectedTab: 'Reviews'
    }
  }
})

var app = new Vue({
  el: '#app',
  data: {
    premium: true,
    cart: []
  },
  methods: {
    updateCart(id) {
      this.cart.push(id)
    },
    removeItem(id) {
      for(var i = this.cart.length - 1; i >= 0; i--) {
        if(this.cart[i] === id) {
          this.cart.splice(i, 1);
        }
      }
    }
  }
})
