<template>
  <div class="polaroid" :class="{ eliminated: elim, bombshell: isBombshell }">
    <div class="photo" :style="{ background: islander.gradient }">
      <img
        v-if="islander.photo"
        :src="islander.photo"
        :alt="islander.name"
        class="photo-img"
        @error="e => e.target.style.display = 'none'"
      />
      <span v-else class="initials">{{ initials }}</span>
      <span v-if="elim" class="stamp">OUT</span>
    </div>
    <div class="caption">
      <p class="name">{{ islander.name }}</p>
      <p class="meta">
        <span class="pill" :class="elim ? 'pill-out' : isBombshell ? 'pill-bombshell' : 'pill-active'">
          {{ elim ? 'Eliminated' : isBombshell ? 'Active' : 'Active' }}
        </span>
      </p>
      <p class="pts">{{ points }} <span class="pts-label">pts</span></p>
      <p v-if="partner" class="couple-tag">{{ partner }} ❤</p>
      <p class="gender-tag">{{ islander.gender === 'female' ? '♀ Girl' : '♂ Boy' }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getIslanderPoints, isEliminated, getPartner } from '../store/game.js'

const props = defineProps({
  islander: { type: Object, required: true },
  isBombshell: { type: Boolean, default: false },
})

const initials = computed(() =>
  props.islander.name.split(' ').map(w => w[0]).join('').toUpperCase()
)
const points  = computed(() => getIslanderPoints(props.islander.name))
const elim    = computed(() => isEliminated(props.islander.name))
const partner = computed(() => getPartner(props.islander.name))
</script>

<style scoped>
.polaroid {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(0,0,0,.15), 0 1px 4px rgba(0,0,0,.1);
  padding: 10px 10px 16px;
  width: 180px;
  flex-shrink: 0;
  transform: rotate(var(--tilt, -1.5deg));
  transition: transform .25s, box-shadow .25s;
  cursor: pointer;
}
.polaroid:nth-child(even) { --tilt: 1.5deg; }
.polaroid:nth-child(3n)   { --tilt: -0.5deg; }

.polaroid:hover {
  transform: rotate(0deg) scale(1.06);
  box-shadow: 0 12px 40px rgba(255,27,141,.25);
  z-index: 10;
}

.polaroid.eliminated { opacity: .55; filter: grayscale(.6); }

.photo {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.photo-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.initials {
  font-family: 'Pacifico', cursive;
  font-size: 2.8rem;
  color: rgba(255,255,255,.9);
  text-shadow: 0 2px 8px rgba(0,0,0,.3);
  user-select: none;
}

.stamp {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,.45);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Pacifico', cursive;
  font-size: 1.6rem;
  color: #f00;
  border: 4px solid #f00;
  border-radius: 4px;
  margin: 16px;
  letter-spacing: .1em;
  opacity: .85;
}

.caption { text-align: center; margin-top: 10px; }

.name {
  font-family: 'Pacifico', cursive;
  font-size: 1.05rem;
  color: var(--pink);
  margin-bottom: 4px;
}

.meta { margin-bottom: 6px; }

.pts {
  font-size: 1.4rem;
  font-weight: 900;
  color: var(--text);
}
.pts-label {
  font-size: .75rem;
  font-weight: 700;
  color: var(--text-mid);
}

.couple-tag {
  display: inline-block;
  font-size: .68rem;
  font-weight: 800;
  color: #c2185b;
  background: #fce4ec;
  border-radius: 999px;
  padding: 2px 8px;
  margin-top: 4px;
}

.gender-tag {
  font-size: .7rem;
  font-weight: 700;
  color: var(--text-mid);
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: .05em;
}
</style>
