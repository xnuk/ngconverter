String.prototype.switch=function(arr){
	var m
	arr.some(([reg, func])=>{
		if(reg instanceof Function && !!reg(this.toString())){
			m=func(this.toString())
			return true
		}
		if((m=this.toString().match(reg))!=null){
			m=func.apply(null, Array.from(m))
			return true
		}
		return false
	})
	return m
}
const specialChar=new Map([
	['Backquote', '~`'],
	['Backslash', '|\\'],
	['BracketLeft', '{['],
	['BracketRight', '}]'],
	['Minus', '_-'],
	['Equal', '+='],
	['Quote', '"\''],
	['Period', '>.'],
	['Comma', '<,'],
	['Slash', '?/'],
	['Semicolon', ':;']
])
const upperNum=")!@#$%^&*("
const undercase=/^[0-9a-z`\-=\\\[\]';,\.\/]$/
const ord=v=>v.charCodeAt()
const chr=String.fromCharCode
const hicolor='#BCA68E'
const rules=new Map()

rules.export=function(){
	var s=[]
	rules.forEach((v, k)=>{
		if(undercase.exec(chr(k))==null) return
		s.push(chr(k)+chr(v))
	})
	return s.sort().join('')
}
rules.import=function(str){
	rules.clear()
	const table=new Map([...specialChar.values()].map(v=>Array.from(v).reverse()))
	function toUpper(c){
		if(/^[0-9]$/.exec(c)!=null) return upperNum[c|0]
		if(/^[a-z]$/.exec(c)!=null) return c.toUpperCase()
		if(table.has(c)) return table.get(c)
		return null
	}
	const inp=Array.from(str)
	while(inp[0]!==undefined){
		const from=inp.shift()
		const to=inp.shift()
		rules.set(ord(from), ord(to))
		rules.set(ord(toUpper(from)), ord(toUpper(to)))
	}
	return rules
}

const preset=new Map([
	["Qwerty", ""],
	["Dvorak", "'-,w-[.v/z;s=][/]=bxcjdee.fugihdicjhktlnnborplq'rpsotyugvkw,xqyfz;"],
	["Colemak", ";odsefftgdiujnkelinkoyp;rpsrtgulyj"],
	["Workman", ";ibvcmdherfthyiujnkelomlnkopp;rwtbufvcwdyj"],
	["Qwpr", ";eepftikjnkilonjolp;tf"],
	["Norman", ";hdeedfthyirjnkilonpolp;rftkyj"],
	["CarPalx QFMLWY", "adbxcgdtemfngrhiiojakelhmknpobpjrltwvcwfxv"],
	["CarPalx QGMLWB", ";hadbjdtemfngrhiiujakelompnkovp;rltwuyvfwgyb"],
	["CarPalx QGMLWY ", ";hadbjdtemfngrhiiujakelompnkobp;rltwufwg"],
	["Asset", ";rdeejftgdiujnkilonkolp;rftgupyl"],
	["Minimak 4-key", "dtedketk"],
	["Minimak 8-key", "dtedjnkelonjoltk"],
	["Minimak 12-key", ";pdtedfrjnkelonjolp;rftk"]
])

window.addEventListener('load', function(){
	var focus=null // HTMLElement?
	const keys=[...document.querySelectorAll('.key:not([id])')]

	const elTab=document.getElementById('tab')
	const elSelector=document.getElementById('selector')
	const elKeyboard=document.getElementsByClassName('keyboard')[0]
	const elSelect=elSelector.getElementsByTagName('select')[0]
	const elInput=elSelector.getElementsByTagName('input')[0]
	const elEnter=document.getElementById('enter')
	const elFile=document.getElementById('file')

	keys.map(v=>v.onclick=function(){
		if(this.style.backgroundColor){
			this.style.backgroundColor=''
			focus=null
			return
		}
		this.style.backgroundColor=hicolor
		if(focus!=null) focus.style.backgroundColor=''
		focus=this
	})
	window.addEventListener('keydown', function(e){
		if(e.code==='Backspace' || e.code==='Tab') e.preventDefault()
		if(focus!=null){
			const upper=focus.getElementsByClassName('upper')[0]
			const lower=focus.getElementsByClassName('lower')[0]
			const dup=focus.getAttribute('data-upper')|0
			const dlo=focus.getAttribute('data-lower')|0
			const code=e.code
			if(code==='Esc' || code==='Escape'){
				focus.style.backgroundColor=''
				focus=null
				return e.preventDefault()
			}
			if(code==='Backspace'){
				const prev=keys[keys.indexOf(focus)-1]
				if(prev===undefined){
					focus.style.backgroundColor=''
					focus=null
					return e.preventDefault()
				}

				const pup=prev.getAttribute('data-upper')|0
				const plo=prev.getAttribute('data-lower')|0
				const pupper=prev.getElementsByClassName('upper')[0]
				const plower=prev.getElementsByClassName('lower')[0]

				rules.delete(pup)
				rules.delete(plo)
				pupper.textContent=chr(pup)
				plower.textContent=chr(plo)

				focus.style.backgroundColor=''
				focus=prev
				prev.style.backgroundColor=hicolor

				return e.preventDefault()
			}
			if(code==='Delete'){
				rules.delete(dup)
				rules.delete(dlo)
				upper.textContent=chr(dup)
				lower.textContent=chr(dlo)
				focus.style.backgroundColor=''
				focus=null
			}
			const ch=code.switch([
				[/^Key([A-Z])$/, (_, p)=>p+p.toLowerCase()],
				[/^Digit([0-9])$/, (_, p)=>upperNum[p|0]+p],
				[(str=>specialChar.has(str)), m=>specialChar.get(m)]
			])
			if(ch!=null){
				const o=ord(ch[0])
				if(dup!==o){
					rules.set(dup, o)
					rules.set(dlo, ord(ch[1]))
				} else{
					rules.delete(dup)
					rules.delete(dlo)
				}
				upper.textContent=ch[0]
				lower.textContent=ch[1]
				focus.style.backgroundColor=''
				const next=keys[keys.indexOf(focus)+1]
				if(next!==undefined){
					focus=next
					next.style.backgroundColor=hicolor
				} else focus=null
				return e.preventDefault()
			}
		} else{
			const code=e.code
			if(code==='Tab'){
				elTab.onclick()
				return
			}
			if((code==='Esc' || code==='Escape') && elSelector.style.display==='flex'){
				elTab.onclick()
			}
			if(code==='Enter' && elSelector.style.display===''){
				elEnter.onclick()
			}
		}
	}, false)
	elTab.onclick=function(){
		if(elSelector.style.display===''){
			elSelector.style.display='flex'
			elKeyboard.style.filter='blur(1.5rem)'
			elInput.value=rules.export()
			elSelect.value=""
		} else elSelector.style.display=elKeyboard.style.filter=''
	}
	elSelector.addEventListener('click', elTab.onclick, false)
	elSelector.querySelector(':scope>div').addEventListener('click', function(e){
		e.stopPropagation()
	}, false)
	elSelect.onchange=function(){
		elInput.value=(this.value==="")?rules.export():preset.get(this.value)
	}
	document.getElementById('apply').onclick=function(){
		rules.import(elInput.value)
		keys.forEach(el=>{
			const lo=el.getAttribute('data-lower')|0
			const up=el.getAttribute('data-upper')|0
			el.getElementsByClassName('lower')[0].textContent=chr(rules.get(lo) || lo)
			el.getElementsByClassName('upper')[0].textContent=chr(rules.get(up) || up)
		})
		elTab.onclick()
	}
	elEnter.onclick=function(){
		elFile.click()
	}
	elFile.onchange=function(){
		convert(this.files[0]).then(xml=>{
			const a=document.createElement('a')
			a.setAttribute('href', URL.createObjectURL(new Blob([xml], {type: 'text/xml'})))
			a.setAttribute('download', 'output.xml')
			a.textContent='aaa'
			document.getElementsByClassName('hidden')[0].appendChild(a)
			a.click()
			a.remove()
		}).catch(v=>alert(v))
	}
})

XPathResult.prototype[Symbol.iterator]=function*(){
  while(true){
    const z=this.iterateNext()
    if(z==null) break
    yield z
  }
}
var debug
function convert(path){
	return new Promise((res, rej)=>{
		const reader=new FileReader()
		reader.readAsText(path, 'utf-8')
		reader.onload=function(){
			const doc=new DOMParser().parseFromString(reader.result, "text/xml")
			if(doc.documentElement.tagName.toLowerCase()==='parsererror') rej('옳은 xml 파일이 아닙니다.')
			;[...doc.evaluate('/InputEntry/InputSchemeSetting/KeyTable/Key/@at', doc, null, XPathResult.ANY_TYPE, null)].forEach(v=>{
				v.value='0x'+(rules.get(v.value|0)||(v.value|0)).toString(16)
			})
			res(new XMLSerializer().serializeToString(doc))
		}
	})
	
}