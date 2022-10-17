#[inline]
fn to_hex_digit(x: u8) -> u8 {
	let x = x & 0xf;
	x + if x < 10 { b'0' } else { b'A' - 10 }
}

pub struct HexU8(pub u8);

impl HexU8 {
	pub fn from_bytes(s: impl AsRef<[u8]>) -> Option<Self> {
		let s = s.as_ref();
		let s = s.strip_prefix(b"0x").unwrap_or(s);

		if s.is_empty() || s.len() > 2 {
			return None;
		}

		let mut ret: u8 = 0;

		for c in s {
			ret = ret.checked_shl(4)?;
			ret |= match c {
				b'0'..=b'9' => c - b'0',
				b'a'..=b'f' => c - b'a' + 10,
				b'A'..=b'F' => c - b'A' + 10,
				_ => return None,
			}
		}

		Some(Self(ret))
	}

	pub fn display(&self) -> [u8; 4] {
		let data = self.0;
		[b'0', b'x', to_hex_digit(data >> 4), to_hex_digit(data)]
	}
}
